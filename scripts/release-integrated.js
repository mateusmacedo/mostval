#!/usr/bin/env node

/**
 * Script de integração Nx Release + Changeset
 *
 * Fluxo:
 * 1. Verifica se há changesets pendentes (gate)
 * 2. Se houver, executa Nx Release
 * 3. Se não houver, falha com erro claro
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: 'pipe',
      ...options
    });
    return result ? result.trim() : '';
  } catch (error) {
    throw new Error(`Command failed: ${command}\n${error.message}`);
  }
}

function checkChangesetsPending() {
  console.log('🔍 Verificando changesets pendentes...');

  try {
    // Verificar se há arquivos .changeset/*.md (exceto README.md)
    const changesetDir = '.changeset';
    if (!fs.existsSync(changesetDir)) {
      console.log('❌ Diretório .changeset não encontrado');
      return false;
    }

    const files = fs.readdirSync(changesetDir);
    const changesetFiles = files.filter(file =>
      file.endsWith('.md') && file !== 'README.md' && file !== 'config.json'
    );

    if (changesetFiles.length > 0) {
      console.log('✅ Changesets pendentes encontrados:');
      console.log('Arquivos:', changesetFiles.join(', '));

      // Mostrar status para debug
      const status = execCommand('pnpm changeset status');
      console.log('Status:', status);

      return true;
    } else {
      console.log('❌ Nenhum changeset pendente encontrado');
      return false;
    }
  } catch (error) {
    console.log('⚠️  Erro ao verificar changesets:', error.message);
    return false;
  }
}

function getPackageVersions() {
  console.log('🔍 Obtendo versões dos pacotes...');

  try {
    const versions = {};

    // Ler package.json do projeto tsconfig
    const tsconfigPackagePath = 'libs/tsconfig/package.json';
    if (fs.existsSync(tsconfigPackagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(tsconfigPackagePath, 'utf8'));
      versions['@mostval/tsconfig'] = packageJson.version;
    }

    // Verificar se há mudanças no git para detectar versionamento
    try {
      const gitStatus = execCommand('git status --porcelain', { stdio: 'pipe' });
      if (gitStatus.includes('libs/tsconfig/package.json')) {
        console.log('📦 Detected version changes in @mostval/tsconfig');
      }
    } catch (gitError) {
      console.log('⚠️  Erro ao verificar status git:', gitError.message);
    }

    return versions;
  } catch (error) {
    console.log('⚠️  Erro ao obter versões:', error.message);
    return {};
  }
}

function createTagsAndCommit(versions) {
  console.log('🏷️  Criando tags e commit com versões...');
  
  try {
    // Configurar identidade Git se não estiver configurada
    try {
      execCommand('git config user.name "GitHub Actions Bot"', { stdio: 'pipe' });
      execCommand('git config user.email "actions@github.com"', { stdio: 'pipe' });
      console.log('✅ Identidade Git configurada');
    } catch (configError) {
      console.log('⚠️  Aviso: Erro ao configurar identidade Git:', configError.message);
    }
    
    // Fazer commit das mudanças de versionamento
    const versionEntries = Object.entries(versions);
    if (versionEntries.length === 0) {
      console.log('ℹ️  Nenhuma versão para processar');
      return;
    }
    
    // Criar mensagem de commit com versões seguindo padrão commitlint
    const versionText = versionEntries
      .map(([pkg, version]) => `${pkg}@${version}`)
      .join(' ');
    
    const commitMessage = `🚀 chore(release): version packages ${versionText}`;
    
    console.log('📝 Fazendo commit das mudanças...');
    execCommand('git add .', { stdio: 'inherit' });
    
    // Verificar se há mudanças para commitar
    try {
      const gitStatus = execCommand('git status --porcelain', { stdio: 'pipe' });
      if (gitStatus.trim()) {
        execCommand(`git commit -m "${commitMessage}"`, { stdio: 'inherit' });
        console.log('✅ Commit realizado com sucesso');
      } else {
        console.log('ℹ️  Nenhuma mudança para commitar');
      }
    } catch (commitError) {
      console.log('⚠️  Aviso: Erro ao fazer commit:', commitError.message);
    }

    // Criar tags para cada pacote
    for (const [pkg, version] of versionEntries) {
      const tagName = `${pkg}@${version}`;
      console.log(`🏷️  Criando tag: ${tagName}`);
      try {
        execCommand(`git tag -a "${tagName}" -m "Release ${tagName}"`, { stdio: 'inherit' });
        console.log(`✅ Tag ${tagName} criada com sucesso`);
      } catch (tagError) {
        console.log(`⚠️  Aviso: Erro ao criar tag ${tagName}:`, tagError.message);
      }
    }

  } catch (error) {
    console.log('⚠️  Erro ao criar tags e commit:', error.message);
  }
}

function runNxRelease(args = []) {
  console.log('🚀 Executando Nx Release...');

  const command = `pnpm nx release ${args.join(' ')}`;
  console.log(`Executando: ${command}`);

  try {
    execCommand(command, { stdio: 'inherit' });
    console.log('✅ Nx Release executado com sucesso');

    // Após Nx Release, consumir changesets para finalizar
    console.log('🧹 Consumindo changesets...');
    try {
      execCommand('pnpm changeset version', { stdio: 'inherit' });
      console.log('✅ Changesets consumidos com sucesso');

      // Obter versões atualizadas e criar tags/commit
      const versions = getPackageVersions();
      createTagsAndCommit(versions);

      // Publicar no GitHub Packages
      console.log('📦 Publicando no GitHub Packages...');
      try {
        execCommand('pnpm changeset publish', { stdio: 'inherit' });
        console.log('✅ Publicação no GitHub Packages realizada com sucesso');
      } catch (publishError) {
        console.log('⚠️  Aviso: Erro ao publicar no GitHub Packages:', publishError.message);
        // Não falhar o processo se publicação falhar
      }

    } catch (changesetError) {
      console.log('⚠️  Aviso: Erro ao consumir changesets:', changesetError.message);
      // Não falhar o processo se changeset falhar
    }
  } catch (error) {
    // Nx Release pode falhar se não houver mudanças, isso é normal
    if (error.message.includes('No changes were detected')) {
      console.log('ℹ️  Nenhuma mudança detectada pelo Nx Release (comportamento esperado)');
      return;
    }
    console.error('❌ Erro ao executar Nx Release:', error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isFirstRelease = args.includes('--first-release');

  console.log('🔄 Iniciando processo de release integrado...');
  console.log(`Argumentos: ${args.join(' ')}`);

  // Verificar se é primeira release ou dry-run
  if (isFirstRelease || isDryRun) {
    console.log('🆕 Primeira release ou dry-run detectado, pulando verificação de changesets');
    runNxRelease(args);
    return;
  }

  // Verificar changesets pendentes
  if (!checkChangesetsPending()) {
    console.log(`
❌ ERRO: Nenhum changeset pendente encontrado!

Para criar um changeset:
  pnpm changeset add

Para verificar status:
  pnpm changeset status
    `);
    process.exit(1);
  }

  // Executar Nx Release
  runNxRelease(args);
}

if (require.main === module) {
  main();
}

module.exports = { checkChangesetsPending, runNxRelease };
