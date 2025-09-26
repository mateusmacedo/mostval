#!/usr/bin/env node

/**
 * Script de validação da configuração Jest no workspace Nx
 * Verifica se todas as configurações estão corretas e funcionais
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

class JestSetupValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
      },
    };
  }

  addCheck(name, status, message, type = 'info') {
    this.results.checks.push({
      name,
      status,
      message,
      type,
    });
    
    this.results.summary.total++;
    if (status === 'pass') this.results.summary.passed++;
    else if (status === 'fail') this.results.summary.failed++;
    else if (status === 'warning') this.results.summary.warnings++;
  }

  checkFileExists(filePath, description) {
    const exists = fs.existsSync(filePath);
    this.addCheck(
      `File: ${description}`,
      exists ? 'pass' : 'fail',
      exists ? `✅ ${filePath} exists` : `❌ ${filePath} not found`
    );
    return exists;
  }

  checkNxConfiguration() {
    console.log('🔍 Verificando configuração do Nx...');
    
    try {
      // Verificar se nx.json existe e tem configuração do Jest
      const nxJsonPath = path.join(process.cwd(), 'nx.json');
      if (this.checkFileExists(nxJsonPath, 'nx.json')) {
        const nxJson = JSON.parse(fs.readFileSync(nxJsonPath, 'utf8'));
        
        // Verificar se plugin Jest está configurado
        const jestPlugin = nxJson.plugins?.find(p => 
          p.plugin === '@nx/jest/plugin' || p === '@nx/jest/plugin'
        );
        
        this.addCheck(
          'Jest Plugin Configuration',
          jestPlugin ? 'pass' : 'fail',
          jestPlugin ? '✅ Plugin Jest configurado' : '❌ Plugin Jest não encontrado'
        );

        // Verificar configurações de CI
        const hasCiConfig = nxJson.targetDefaults?.test?.configurations?.ci;
        this.addCheck(
          'CI Configuration',
          hasCiConfig ? 'pass' : 'warning',
          hasCiConfig ? '✅ Configuração CI presente' : '⚠️  Configuração CI não encontrada'
        );
      }
    } catch (error) {
      this.addCheck('Nx Configuration', 'fail', `❌ Erro ao ler nx.json: ${error.message}`);
    }
  }

  checkJestFiles() {
    console.log('🔍 Verificando arquivos Jest...');
    
    const requiredFiles = [
      { path: 'jest.config.ts', description: 'Jest config principal' },
      { path: 'jest.preset.js', description: 'Jest preset' },
      { path: 'jest.setup.ts', description: 'Jest setup global' },
    ];

    const optionalFiles = [
      { path: 'jest.setup.react.ts', description: 'Jest setup React' },
      { path: 'jest.config.template.ts', description: 'Template de configuração' },
      { path: 'jest.config.environments.ts', description: 'Configurações por ambiente' },
    ];

    requiredFiles.forEach(file => {
      this.checkFileExists(file.path, file.description);
    });

    optionalFiles.forEach(file => {
      const exists = fs.existsSync(file.path);
      this.addCheck(
        `Optional: ${file.description}`,
        exists ? 'pass' : 'warning',
        exists ? `✅ ${file.path} exists` : `⚠️  ${file.path} not found (optional)`
      );
    });
  }

  checkPackageJson() {
    console.log('🔍 Verificando package.json...');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Verificar dependências Jest
      const jestDeps = ['jest', '@nx/jest', '@swc/jest', 'ts-jest'];
      jestDeps.forEach(dep => {
        const hasDep = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
        this.addCheck(
          `Dependency: ${dep}`,
          hasDep ? 'pass' : 'fail',
          hasDep ? `✅ ${dep} instalado` : `❌ ${dep} não encontrado`
        );
      });

      // Verificar scripts de teste
      const testScripts = ['test', 'test:coverage', 'test:parallel', 'test:ci'];
      testScripts.forEach(script => {
        const hasScript = packageJson.scripts?.[script];
        this.addCheck(
          `Script: ${script}`,
          hasScript ? 'pass' : 'warning',
          hasScript ? `✅ Script ${script} configurado` : `⚠️  Script ${script} não encontrado`
        );
      });
    } catch (error) {
      this.addCheck('Package.json', 'fail', `❌ Erro ao ler package.json: ${error.message}`);
    }
  }

  checkJestConfiguration() {
    console.log('🔍 Verificando configuração Jest...');
    
    try {
      // Verificar jest.config.ts
      if (fs.existsSync('jest.config.ts')) {
        const jestConfig = fs.readFileSync('jest.config.ts', 'utf8');
        
        this.addCheck(
          'getJestProjectsAsync Usage',
          jestConfig.includes('getJestProjectsAsync') ? 'pass' : 'fail',
          jestConfig.includes('getJestProjectsAsync') 
            ? '✅ Usando getJestProjectsAsync (Nx 18+)' 
            : '❌ Não está usando getJestProjectsAsync'
        );
      }

      // Verificar jest.preset.js
      if (fs.existsSync('jest.preset.js')) {
        const preset = fs.readFileSync('jest.preset.js', 'utf8');
        
        this.addCheck(
          'SWC Transformer',
          preset.includes('@swc/jest') ? 'pass' : 'warning',
          preset.includes('@swc/jest') 
            ? '✅ SWC configurado como transformer' 
            : '⚠️  SWC não configurado'
        );

        this.addCheck(
          'Coverage Thresholds',
          preset.includes('coverageThreshold') ? 'pass' : 'warning',
          preset.includes('coverageThreshold') 
            ? '✅ Coverage thresholds definidos' 
            : '⚠️  Coverage thresholds não definidos'
        );
      }
    } catch (error) {
      this.addCheck('Jest Configuration', 'fail', `❌ Erro ao verificar configuração: ${error.message}`);
    }
  }

  checkNxCommands() {
    console.log('🔍 Verificando comandos Nx...');
    
    try {
      // Verificar se nx está funcionando
      execSync('nx --version', { stdio: 'pipe' });
      this.addCheck('Nx CLI', 'pass', '✅ Nx CLI funcionando');
    } catch (error) {
      this.addCheck('Nx CLI', 'fail', `❌ Nx CLI não funcionando: ${error.message}`);
    }

    try {
      // Verificar se projetos são listados
      const projects = execSync('nx show projects', { encoding: 'utf8', stdio: 'pipe' });
      const projectCount = projects.trim().split('\n').length;
      this.addCheck(
        'Nx Projects',
        projectCount > 0 ? 'pass' : 'warning',
        projectCount > 0 ? `✅ ${projectCount} projetos encontrados` : '⚠️  Nenhum projeto encontrado'
      );
    } catch (error) {
      this.addCheck('Nx Projects', 'fail', `❌ Erro ao listar projetos: ${error.message}`);
    }
  }

  checkPerformanceScripts() {
    console.log('🔍 Verificando scripts de performance...');
    
    const performanceFiles = [
      'scripts/test-performance.js',
      'scripts/optimize-tests.js',
      'scripts/validate-jest-setup.js',
    ];

    performanceFiles.forEach(file => {
      this.checkFileExists(file, `Script: ${path.basename(file)}`);
    });
  }

  generateReport() {
    console.log('\n📊 Relatório de Validação da Configuração Jest');
    console.log('==============================================');
    
    this.results.checks.forEach(check => {
      const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
      console.log(`${icon} ${check.name}: ${check.message}`);
    });

    console.log('\n📈 Resumo:');
    console.log(`Total de verificações: ${this.results.summary.total}`);
    console.log(`✅ Aprovadas: ${this.results.summary.passed}`);
    console.log(`❌ Falharam: ${this.results.summary.failed}`);
    console.log(`⚠️  Avisos: ${this.results.summary.warnings}`);

    const successRate = (this.results.summary.passed / this.results.summary.total * 100).toFixed(1);
    console.log(`\n🎯 Taxa de sucesso: ${successRate}%`);

    if (this.results.summary.failed === 0) {
      console.log('\n🎉 Parabéns! Sua configuração Jest está otimizada!');
    } else {
      console.log('\n🔧 Algumas configurações precisam de atenção.');
    }

    // Salvar relatório
    const reportPath = path.join(process.cwd(), 'jest-validation-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n📄 Relatório salvo em: ${reportPath}`);

    return this.results;
  }

  async validate() {
    console.log('🚀 Iniciando validação da configuração Jest...\n');
    
    this.checkNxConfiguration();
    this.checkJestFiles();
    this.checkPackageJson();
    this.checkJestConfiguration();
    this.checkNxCommands();
    this.checkPerformanceScripts();
    
    return this.generateReport();
  }
}

// Executar validação se chamado diretamente
if (require.main === module) {
  const validator = new JestSetupValidator();
  validator.validate().catch(error => {
    console.error('❌ Erro durante validação:', error);
    process.exit(1);
  });
}

module.exports = JestSetupValidator;
