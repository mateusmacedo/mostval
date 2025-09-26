# 🚀 Sistema de Release e Versionamento

Sistema completo de versionamento automático baseado em conventional commits para projetos Node.js e Go.

## 📋 Funcionalidades

- ✅ **Versionamento automático** baseado em conventional commits
- ✅ **Changelog automático** por projeto
- ✅ **Releases independentes** - cada projeto tem seu próprio ciclo de release
- ✅ **Integração com GitHub** - releases automáticos via GitHub Actions
- ✅ **Validação de commits** - enforce conventional commits
- ✅ **Scripts de conveniência** para uso local

## 🚀 Comandos Essenciais

### **Verificar antes de lançar (SEMPRE!)**
```bash
./scripts/release.sh dry-run
```

### **Lançar tudo que mudou**
```bash
./scripts/release.sh full
```

### **Lançar projeto específico**
```bash
./scripts/release.sh full <project-name>
```

### **Comandos individuais (Node.js apenas)**
```bash
./scripts/release.sh version <project-name>
./scripts/release.sh changelog <project-name>
./scripts/release.sh publish <project-name>
```

## 🔄 Workflow com Changeset (Alternativo)

### **Desenvolvimento Diário**
```bash
# 1. Fazer suas mudanças
git add .
git commit -m "feat: nova funcionalidade"

# 2. Criar changeset
pnpm changeset:add

# 3. Commit do changeset
git add .changeset/
git commit -m "chore: add changeset"
```

### **Release com Changeset**
```bash
# 1. Verificar status
pnpm changeset:status

# 2. Aplicar versionamento
pnpm changeset:version

# 3. Build e publish
pnpm release:changeset

# 4. Push das mudanças
git push origin main --tags
```

### **Scripts Changeset Disponíveis**
```bash
# Criar um changeset
pnpm changeset:add

# Verificar status
pnpm changeset:status

# Aplicar versionamento
pnpm changeset:version

# Publicar
pnpm changeset:publish

# Workflow completo
pnpm release:changeset
```

## 📝 Conventional Commits

### **Para versionamento automático:**
```bash
# Feature (minor bump: 1.0.0 → 1.1.0)
git commit -m "✨ feat(<project-name>): add new method"
git commit -m "✨ feat(<project-name>): add new endpoint"

# Bug fix (patch bump: 1.0.0 → 1.0.1)
git commit -m "🐛 fix(<project-name>): resolve memory leak"
git commit -m "🐛 fix(<project-name>): fix timestamp issue"

# Breaking change (major bump: 1.0.0 → 2.0.0)
git commit -m "✨ feat!(<project-name>): change API interface"
git commit -m "✨ feat!(<project-name>): restructure endpoints"
```

### **Para commits sem versionamento:**
```bash
# Chores, docs, etc. (sem bump)
git commit -m "🔨 chore: update dependencies"
git commit -m "📚 docs: update README"
git commit -m "✅ test: add unit tests"
git commit -m "♻️ refactor: improve code structure"
```

### **Tipos de Versionamento:**

| Tipo de Commit | Bump de Versão | Exemplo |
|----------------|----------------|---------|
| `feat(scope):` | **minor** (1.0.0 → 1.1.0) | Nova funcionalidade |
| `fix(scope):` | **patch** (1.0.0 → 1.0.1) | Correção de bug |
| `feat!(scope):` | **major** (1.0.0 → 2.0.0) | Breaking change |
| `chore:`, `docs:` | **nenhum** | Sem versionamento |

## ✅ Checklist Rápido

- [ ] Commits seguem conventional commits?
- [ ] Executei `dry-run` para verificar?
- [ ] Há mudanças para lançar?
- [ ] Estou no branch correto?
- [ ] Repositório está sincronizado?

## 🔍 Verificar Resultado

```bash
# Ver tags criadas
git tag -l

# Ver changelogs gerados
cat libs/<lib-name>/CHANGELOG.md
cat apps/<app-name>/CHANGELOG.md

# Ver versões atualizadas
grep '"version"' libs/<lib-name>/package.json
grep '"version"' apps/<app-name>/package.json
```

## 🎯 Como Funciona

### **Versionamento Seletivo**
- ✅ **Apenas projetos com mudanças** são versionados
- ✅ **Detecção automática** baseada em conventional commits
- ✅ **Scopes específicos** afetam apenas o projeto correspondente

### **Exemplos de Comportamento:**

```bash
# Cenário 1: Apenas um projeto tem mudanças
git commit -m "✨ feat(<project-name>): add new method"
# Resultado: Apenas o projeto será versionado

# Cenário 2: Múltiplos projetos
git commit -m "✨ feat(<project-name>): add feature"
git commit -m "🐛 fix(<project-name>): resolve bug"
# Resultado: Ambos os projetos serão versionados

# Cenário 3: Apenas chores
git commit -m "🔨 chore: update dependencies"
# Resultado: Nenhum projeto será versionado
```

## 🔧 Configuração Técnica

### **Projetos Configurados:**
- `<project-name>` (Node.js - npm)
- `<project-name>` (Go - local)
- `<project-name>` (Go - local)

### **Scopes Válidos:**
- `<project-name>` - Projeto Node.js
- `<project-name>` - Projeto Go (biblioteca)
- `<project-name>` - Projeto Go (aplicação)
- `<project-name>` - Projeto NestJS
- `source` - Projeto raiz

### **Arquivos Gerados:**
- **Tags Git:** `<project-name>@1.1.0`
- **Changelogs:** `libs/<lib-name>/CHANGELOG.md`
- **Versões:** Atualizadas em `package.json`

## 🔄 Sistema Unificado

O sistema de release é **completamente transparente** e funciona da mesma forma para todos os projetos, independente da linguagem:

### ✅ **Interface Unificada:**
- **Uma única instrução** para todos os projetos
- **Detecção automática** do tipo de projeto
- **Comportamento transparente** baseado na linguagem

### 🚀 **Uso Universal:**
```bash
# Funciona para TODOS os projetos (Node.js, Go, etc.)
./scripts/release.sh dry-run                    # Todos os projetos
./scripts/release.sh dry-run <project-name>     # Node.js
./scripts/release.sh dry-run <project-name>    # Go
./scripts/release.sh full <project-name>        # Go

# Comandos individuais também funcionam
./scripts/release.sh version <project-name>
./scripts/release.sh changelog <project-name>
```

### 🎯 **Comportamento por Linguagem:**

#### **Projetos Node.js** (`<project-name>`):
- ✅ Versionamento automático via Nx Release
- ✅ Changelog automático
- ✅ Tags Git automáticas
- ✅ Publicação no npm
- ✅ Todos os comandos suportados

#### **Projetos Go** (`<project-name>`):
- ✅ Versionamento automático via script customizado
- ✅ Changelog automático
- ✅ Tags Git automáticas
- ❌ Não são publicados no npm (apenas versionamento local)
- ⚠️ Alguns comandos têm limitações (dry-run, version, changelog individuais)

## 📝 Exemplos Práticos de Changeset

### **1. Correção de Bug (Patch)**
```bash
# Fazer a correção
git add .
git commit -m "fix: corrige validação de email no <project-name>"

# Criar changeset
pnpm changeset:add
# Selecionar: <project-name>
# Tipo: patch
# Descrição: "fix: corrige validação de email no <project-name>"
```

### **2. Nova Funcionalidade (Minor)**
```bash
# Implementar funcionalidade
git add .
git commit -m "feat: adiciona suporte a OAuth2 no <project-name>"

# Criar changeset
pnpm changeset:add
# Selecionar: <project-name>
# Tipo: minor
# Descrição: "feat: adiciona suporte a OAuth2 no <project-name>"
```

### **3. Mudança que Quebra Compatibilidade (Major)**
```bash
# Implementar mudança
git add .
git commit -m "feat!: refatora API do <project-name> para v2"

# Criar changeset
pnpm changeset:add
# Selecionar: <project-name>
# Tipo: major
# Descrição: "feat!: refatora API do <project-name> para v2"
```

### **4. Múltiplos Projetos**
```bash
# Fazer mudanças em múltiplos projetos
git add .
git commit -m "feat: implementa logging unificado"

# Criar changeset
pnpm changeset:add
# Selecionar: <project-name>, <project-name>
# Tipo: minor
# Descrição: "feat: implementa logging unificado"
```

## 🔧 Configuração Avançada

### Adicionar Novo Projeto ao Release

1. Edite `nx.json`:
```json
{
  "release": {
    "projects": [
      "<project-name>",
      "<novo-projeto>"  // ← Adicione aqui
    ]
  }
}
```

2. Configure o `package.json` do projeto:
```json
{
  "name": "<workspace-name>/novo-projeto",
  "version": "0.0.0",
  "publishConfig": {
    "access": "public"
  }
}
```

### Personalizar Changelog

Edite `nx.json`:
```json
{
  "release": {
    "changelog": {
      "entry": {
        "changelog": {
          "generator": "@nx/js:release-changelog",
          "generatorOptions": {
            "changelogHeader": "# Changelog\n\nAll notable changes...",
            "file": "{projectRoot}/CHANGELOG.md"
          }
        }
      }
    }
  }
}
```

## 🐛 Troubleshooting

### Erro: "No changes to release"
- Verifique se há commits desde a última release
- Use `git log --oneline` para ver commits recentes
- Certifique-se de que os commits seguem conventional commits

### Erro: "Permission denied"
- Verifique se o `NPM_TOKEN` está configurado
- Verifique permissões do repositório GitHub

### Erro: "Build failed"
- Execute `pnpm dlx nx run-many -t build` localmente
- Verifique se todos os projetos compilam corretamente

### Troubleshooting Changeset

#### **Problema**: Changeset não encontra pacotes
```bash
# Verificar se os package.json estão corretos
ls -la libs/*/package.json
```

#### **Problema**: Build falha
```bash
# Executar build manualmente
pnpm nx run-many -t build
```

#### **Problema**: Publish falha
```bash
# Verificar tokens de autenticação
echo $NPM_TOKEN
```

#### **Problema**: Changeset não funciona
```bash
# Verificar configuração
cat .changeset/config.json

# Verificar status
pnpm changeset:status
```

## 🆘 Problemas Comuns

| Problema | Solução |
|----------|---------|
| "No changes to release" | Fazer commits com conventional commits |
| "Permission denied" | `chmod +x scripts/release.sh` |
| "Build failed" | `pnpm dlx nx run-many -t build` |
| "Git remote undefined" | `git remote add origin <url>` |

## 📚 Recursos Adicionais

- [Nx Release Documentation](https://nx.dev/recipes/nx-release/release-npm-packages)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## 🚨 Importante

- **Sempre execute `dry-run` antes do release real**
- **Verifique se os commits seguem conventional commits**
- **Mantenha o repositório sincronizado antes do release**
- **O sistema é transparente - funciona igual para todas as linguagens**

---

**💡 Dica:** Comece sempre com `./scripts/release.sh dry-run` para ver o que será lançado!