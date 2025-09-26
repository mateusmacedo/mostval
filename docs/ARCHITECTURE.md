# 🏗️ Arquitetura do Workspace

Este documento descreve a arquitetura e decisões de design do workspace Nx.

## 📋 Visão Geral

Este workspace é um **monorepo Nx** configurado como template para desenvolvimento de aplicações JavaScript/TypeScript e Go, com foco em:

- **Desenvolvimento eficiente** com cache inteligente
- **Qualidade de código** com linting e testes automatizados
- **Release automático** baseado em conventional commits
- **Flexibilidade** para diferentes tipos de projetos

## 🎯 Princípios Arquiteturais

### **1. Monorepo com Nx**
- **Single source of truth** para dependências
- **Cache inteligente** para builds e testes
- **Comandos afetados** executam apenas em projetos modificados
- **Dependency graph** para análise de impacto

### **2. Configuração Centralizada**
- **Jest centralizado** no root com `getJestProjects()`
- **Biome** para linting e formatação
- **Scripts padronizados** no package.json
- **Plugins Nx** para automação

### **3. Qualidade de Código**
- **Conventional Commits** para versionamento automático
- **Coverage thresholds** de 60%
- **Linting obrigatório** antes de commits
- **Testes automatizados** com CI/CD

## 📁 Estrutura do Workspace

```
workspace/
├── apps/                    # Aplicações
│   ├── <app-name>/         # Aplicação específica
│   │   ├── src/            # Código fonte
│   │   ├── jest.config.js  # Config Jest (auto-gerado)
│   │   └── project.json    # Config Nx (auto-gerado)
│   └── ...
├── libs/                   # Bibliotecas compartilhadas
│   ├── <lib-name>/         # Biblioteca específica
│   │   ├── src/            # Código fonte
│   │   ├── jest.config.js  # Config Jest (auto-gerado)
│   │   └── project.json    # Config Nx (auto-gerado)
│   └── ...
├── scripts/                # Scripts essenciais
│   └── release.sh          # Script de release
├── docs/                   # Documentação
├── jest.config.js          # Configuração Jest (root)
├── jest.setup.js           # Setup global Jest
├── biome.json              # Configuração Biome
├── nx.json                 # Configuração Nx
├── package.json            # Dependências e scripts
└── tsconfig.base.json      # TypeScript base
```

## 🔧 Configurações Principais

### **Nx (nx.json)**
```json
{
  "plugins": [
    "@nx/js/typescript",
    "@nx/jest/plugin",
    "@nx-go/nx-go",
    "@nx/webpack/plugin",
    "@nx/playwright/plugin"
  ],
  "targetDefaults": {
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["{projectRoot}/coverage"]
    },
    "biome:lint": {
      "cache": true,
      "inputs": ["default", "^default", "{workspaceRoot}/biome.json"]
    }
  }
}
```

### **Jest (jest.config.js)**
```javascript
const { getJestProjects } = require('@nx/jest');

module.exports = {
  projects: getJestProjects(),
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  // Performance otimizada
  maxWorkers: process.env.CI === 'true' ? '50%' : '100%',
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
};
```

### **Biome (biome.json)**
```json
{
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error",
        "noUnusedFunctionParameters": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": true
  }
}
```

## 🚀 Fluxo de Desenvolvimento

### **1. Desenvolvimento Local**
```bash
# 1. Fazer mudanças
git checkout -b feat/nova-funcionalidade

# 2. Desenvolver
# ... código ...

# 3. Linting
pnpm lint
pnpm lint:fix

# 4. Testes
pnpm test
pnpm test:go

# 5. Commit
git commit -m "feat: adiciona nova funcionalidade"
```

### **2. Release Automático**
```bash
# 1. Verificar mudanças
./scripts/release.sh dry-run

# 2. Release
./scripts/release.sh full

# 3. Push
git push origin main --tags
```

## 🔄 Sistema de Release

### **Versionamento Automático**
- **Conventional Commits** determinam tipo de bump
- **Scopes específicos** afetam apenas projetos correspondentes
- **Releases independentes** por projeto
- **Changelog automático** por projeto

### **Tipos de Versionamento**
| Commit Type | Bump Type | Example |
|-------------|-----------|---------|
| `feat(scope):` | minor | 1.0.0 → 1.1.0 |
| `fix(scope):` | patch | 1.0.0 → 1.0.1 |
| `feat!(scope):` | major | 1.0.0 → 2.0.0 |
| `chore:`, `docs:` | none | Sem versionamento |

## 🎯 Decisões de Design

### **Por que Nx?**
- **Cache inteligente** reduz tempo de build
- **Comandos afetados** executam apenas o necessário
- **Dependency graph** para análise de impacto
- **Plugins** para automação de tarefas

### **Por que Jest centralizado?**
- **Configuração única** para todo o workspace
- **Plugins Nx** gerenciam projetos automaticamente
- **Performance** com cache compartilhado
- **Manutenção** simplificada

### **Por que Biome?**
- **All-in-one** (linting + formatação)
- **Performance** superior ao ESLint + Prettier
- **Configuração simples** com regras recomendadas
- **Integração Nx** nativa

### **Por que Conventional Commits?**
- **Versionamento automático** baseado em commits
- **Changelog automático** por projeto
- **Padrão da indústria** amplamente adotado
- **Integração** com ferramentas de release

## 📊 Métricas e Monitoramento

### **Coverage**
- **Threshold global**: 60% para branches, functions, lines, statements
- **Relatórios**: HTML, LCOV, JSON, JUnit
- **Coverage centralizado** no root

### **Performance**
- **Cache Nx** para builds e testes
- **Workers otimizados** para CI/CD
- **Paralelização** de tarefas

### **Qualidade**
- **Linting obrigatório** antes de commits
- **Testes obrigatórios** antes de release
- **Conventional commits** para versionamento

## 🔮 Roadmap

### **Curto Prazo**
- [ ] Adicionar mais tipos de projetos (Expo, etc.)
- [ ] Melhorar configuração de CI/CD
- [ ] Adicionar métricas de performance

### **Médio Prazo**
- [ ] Integração com ferramentas de análise
- [ ] Configuração de cache remoto
- [ ] Automação de dependências

### **Longo Prazo**
- [ ] Suporte a micro-frontends
- [ ] Integração com cloud providers
- [ ] Automação completa de deployment

## 📚 Referências

- [Nx Documentation](https://nx.dev)
- [Jest Documentation](https://jestjs.io)
- [Biome Documentation](https://biomejs.dev)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

**💡 Dica**: Esta arquitetura é projetada para ser flexível e extensível. Sinta-se à vontade para sugerir melhorias!
