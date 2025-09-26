# 🔄 Integração Nx Release + Changeset

Este documento explica como usar a integração entre Nx Release e Changeset para garantir que não haverá lançamentos sem changeset pendente.

## 🎯 **Objetivo**

- **Changeset** atua como **gate** (verifica se há changesets pendentes)
- **Nx Release** atua como **executor** (faz o versionamento e publicação)
- **Garantia**: Não é possível fazer release sem changeset pendente

## 🚀 **Como Usar**

### 1. **Criar um Changeset**

```bash
# Criar um novo changeset
pnpm changeset add

# Verificar status dos changesets
pnpm changeset status
```

### 2. **Executar Release Integrado**

```bash
# Release normal (com verificação de changeset)
pnpm release:integrated

# Dry-run (teste sem fazer alterações)
pnpm release:integrated:dry-run

# Primeira release (pula verificação de changeset)
pnpm release:integrated:first
```

### 3. **Workflows Disponíveis**

#### **Workflow Híbrido** (Recomendado)
- Arquivo: `.github/workflows/changeset-release.yml`
- Usa Changeset Action + Script Integrado
- Verifica changesets antes de executar

#### **Workflow Nx Puro**
- Arquivo: `.github/workflows/nx-release.yml`
- Usa apenas Nx Release com verificação de changeset
- Mais simples e direto

## 🔧 **Configuração**

### **Script de Integração**
- Arquivo: `scripts/release-integrated.js`
- Verifica arquivos `.changeset/*.md`
- Executa Nx Release se houver changesets

### **Scripts Disponíveis**
```json
{
  "release:integrated": "node scripts/release-integrated.js",
  "release:integrated:dry-run": "node scripts/release-integrated.js --dry-run",
  "release:integrated:first": "node scripts/release-integrated.js --first-release"
}
```

## 📋 **Fluxo de Trabalho**

### **1. Desenvolvimento**
```bash
# Fazer mudanças no código
git add .
git commit -m "feat: nova funcionalidade"
```

### **2. Criar Changeset**
```bash
# Criar changeset para a mudança
pnpm changeset add
# Selecionar: @mostval/node-logger
# Tipo: minor
# Descrição: Adicionada nova funcionalidade
```

### **3. Release**
```bash
# Push para main (dispara workflow)
git push origin main

# Ou release local
pnpm release:integrated
```

## ⚠️ **Comportamentos**

### **Com Changeset Pendente**
```
✅ Changesets pendentes encontrados
🚀 Executando Nx Release...
✅ Release executado com sucesso
```

### **Sem Changeset Pendente**
```
❌ Nenhum changeset pendente encontrado
❌ ERRO: Nenhum changeset pendente encontrado!
```

### **Primeira Release**
```
🆕 Primeira release detectado, pulando verificação
🚀 Executando Nx Release...
```

## 🛠️ **Troubleshooting**

### **Problema: "Nenhum changeset pendente"**
```bash
# Verificar se há changesets
ls .changeset/*.md

# Criar changeset se necessário
pnpm changeset add
```

### **Problema: "No changes were detected"**
- Nx Release não detecta mudanças via conventional commits
- Usar `--first-release` para primeira versão
- Verificar se commits seguem padrão conventional

### **Problema: Permissões GitHub**
- Verificar se `GITHUB_TOKEN` tem permissões `contents: write`
- Verificar se `NPM_TOKEN` está configurado

## 📊 **Vantagens da Integração**

1. **Segurança**: Impossível fazer release sem changeset
2. **Flexibilidade**: Usa Nx Release para versionamento avançado
3. **Controle**: Changeset como gate de qualidade
4. **Automação**: Workflow GitHub Actions completo
5. **Debugging**: Scripts com logs detalhados

## 🔄 **Alternativas**

### **Apenas Changeset**
```bash
pnpm changeset version
pnpm changeset publish
```

### **Apenas Nx Release**
```bash
pnpm nx release
```

### **Integração Manual**
```bash
# Verificar changesets
pnpm changeset status

# Se houver, executar Nx Release
pnpm nx release
```

## 📝 **Exemplos**

### **Cenário 1: Nova Feature**
```bash
# 1. Desenvolvimento
git commit -m "feat: adiciona validação de email"

# 2. Changeset
pnpm changeset add
# Selecionar: @mostval/node-logger
# Tipo: minor

# 3. Release
pnpm release:integrated
```

### **Cenário 2: Bug Fix**
```bash
# 1. Desenvolvimento
git commit -m "fix: corrige validação de CPF"

# 2. Changeset
pnpm changeset add
# Selecionar: @mostval/node-logger
# Tipo: patch

# 3. Release
pnpm release:integrated
```

### **Cenário 3: Breaking Change**
```bash
# 1. Desenvolvimento
git commit -m "feat!: remove método deprecated"

# 2. Changeset
pnpm changeset add
# Selecionar: @mostval/node-logger
# Tipo: major

# 3. Release
pnpm release:integrated
```
