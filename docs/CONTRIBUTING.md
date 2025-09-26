# 🤝 Guia de Contribuição

Este guia cobre todas as ferramentas, processos de desenvolvimento e contribuição do workspace Nx.

## 🚀 Início Rápido

### Pré-requisitos
- **Node.js**: v18+ (recomendado v20+)
- **pnpm**: v8+ (gerenciador de pacotes)
- **Git**: Para controle de versão
- **Go**: v1.21+ (opcional, para projetos Go)

### Configuração Inicial
```bash
# 1. Clone o repositório
git clone <repository-url>
cd <workspace-name>

# 2. Instale dependências
pnpm install

# 3. Verifique a instalação
pnpm test
pnpm lint
```

## 🧪 Testes e Coverage

### Ferramentas de Teste

#### JavaScript/TypeScript
- **Jest**: Framework principal com @swc/jest para compilação rápida
- **Coverage**: Relatórios HTML, LCOV, JSON, JUnit
- **Thresholds**: 60% para branches, functions, lines, statements
- **Configuração centralizada** no root com `getJestProjects()`
- **Plugins Nx** configurados para Jest

#### Go
- **go test**: Framework nativo com coverage
- **go tool cover**: Análise de coverage
- **go-junit-report**: Relatórios JUnit XML

### Comandos de Teste
```bash
# Testes básicos
pnpm test                    # Projetos afetados
nx run-many --target=test --all  # Todos os projetos
nx test <project-name>       # Projeto específico

# Coverage (automático com testes)
pnpm test                    # Projetos afetados (com coverage automático)
nx run-many --target=test --all  # Todos os projetos (com coverage automático)
nx test <project-name>       # Projeto específico (com coverage automático)

# Testes Go
pnpm test:go                 # Testes Go com coverage

# Testes completos
pnpm test:affected          # JS/TS + Go (projetos afetados)
pnpm test:all               # JS/TS + Go (todos os projetos)
```

### Estrutura de Coverage
O workspace atual tem configuração centralizada:

```
workspace/
├── coverage/                 # Coverage centralizado por projeto
│   ├── node-logger/         # Coverage do projeto node-logger
│   └── go/                  # Coverage do projeto Go
│   ├── lcov-report/index.html
│   ├── lcov.info
│   └── junit.xml
└── jest.config.js            # Configuração Jest no root
```

**Nota**: Quando novos projetos forem adicionados, cada um terá seu próprio diretório de coverage.

### Configuração Jest Atual
```javascript
// jest.config.js (root)
const { getJestProjects } = require('@nx/jest');

module.exports = {
  projects: getJestProjects(),
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  // Performance
  maxWorkers: process.env.CI === 'true' ? '50%' : '100%',
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  // Timeout
  testTimeout: 10000,
  // Setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Configurações de ambiente
  testEnvironment: 'node',
  ci: process.env.CI === 'true',
  passWithNoTests: true,
  verbose: process.env.JEST_VERBOSE === 'true',
  silent: process.env.CI === 'true',
};
```

### Características da Configuração Jest
- ✅ **Jest centralizado** no root com `getJestProjects()`
- ✅ **Coverage thresholds**: 60% para branches, functions, lines, statements
- ✅ **Suporte a TypeScript/JSX/JS** via SWC
- ✅ **Performance otimizada** (cache, workers)
- ✅ **CI/CD ready** com configurações específicas
- ✅ **Plugins Nx** configurados para Jest

### Customizações Jest
```javascript
// jest.config.js (root) - Exemplo de customização
const { getJestProjects } = require('@nx/jest');

module.exports = {
  projects: getJestProjects(),
  // Adicionar configurações específicas aqui
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__tests__/**',
  ],
  // ... outras configurações
};
```

### Configuração Go
```bash
# scripts/test-go.sh
go test -v -coverprofile=coverage.out -covermode=atomic ./...
go tool cover -html=coverage.out -o coverage.html
go tool cover -func=coverage.out > coverage.txt
```

## 🔍 Linting

### Ferramentas de Linting

#### Biome (JavaScript/TypeScript)
- **Configuração**: `biome.json` na raiz
- **NestJS**: Configurado para decorators
- **Formatação**: Automática com `--write`

#### Go
- **golint**: Linting de estilo
- **golangci-lint**: Linting avançado (opcional)

### Comandos de Linting
```bash
# Linting básico
pnpm lint                   # Projetos afetados
pnpm lint:fix               # Com correção automática
pnpm format                 # Formatação
pnpm format:fix             # Formatação com correção
pnpm check                  # Verificação completa
pnpm check:fix              # Verificação com correção

# Comandos Nx
nx affected --target=biome:lint <project-name>  # Projeto específico
nx run-many --target=biome:lint --all           # Todos os projetos
nx affected --target=biome:lint                 # Projetos afetados
```

### Configuração Biome
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

## 🚀 Integração Nx

### Comandos Afetados
O Nx executa apenas em projetos modificados:

```bash
# Comandos inteligentes
nx affected --target=biome:lint
nx affected --target=test
nx affected --target=go:test

# Ver projetos afetados
nx show projects --affected
```

### Cache Inteligente
- **Cache local**: Resultados reutilizados automaticamente
- **Cache remoto**: Configurável para equipe
- **Invalidação**: Automática quando inputs mudam

### Paralelização
```bash
# Execução paralela
nx run-many --target=test --all --parallel=4

# Controle de concorrência
nx run-many --target=biome:lint --all --maxParallel=2
```

### Análise de Dependências
```bash
# Grafo de dependências
nx graph

# Análise de impacto
nx show projects --affected --base=main

# Dependências de um projeto
nx show project <project-name> --web
```

## 🤝 Processo de Contribuição

### 1. Fork e Clone
```bash
# Fork o repositório no GitHub
# Clone seu fork
git clone https://github.com/SEU_USUARIO/workspace-name.git
cd workspace-name

# Adicione o repositório original como upstream
git remote add upstream https://github.com/ORIGINAL_OWNER/workspace-name.git
```

### 2. Configurar Ambiente
```bash
# Instalar dependências
pnpm install

# Verificar instalação
pnpm test
pnpm lint
```

### 3. Criar Branch
```bash
# Atualizar main
git checkout main
git pull upstream main

# Criar branch para feature
git checkout -b feat/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
```

## 🔧 Padrões de Desenvolvimento

### **Commits**
Siga o padrão [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Features
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "feat(scope): adiciona método específico"

# Bug fixes
git commit -m "fix: corrige problema de validação"
git commit -m "fix(scope): corrige vazamento de memória"

# Breaking changes
git commit -m "feat!: refatora API para v2"
git commit -m "fix!: remove método depreciado"

# Outros tipos
git commit -m "docs: atualiza documentação"
git commit -m "test: adiciona testes unitários"
git commit -m "refactor: melhora estrutura do código"
git commit -m "chore: atualiza dependências"
```

### **Linting e Formatação**
```bash
# Sempre execute antes de commitar
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:fix
pnpm check
pnpm check:fix
```

### **Testes**
```bash
# Execute testes antes de commitar
pnpm test
pnpm test:go
pnpm test:affected

# Verificar coverage
pnpm test  # Coverage automático
```

## 📝 Checklist de Pull Request

### **Antes de Abrir PR**
- [ ] Código segue padrões de linting
- [ ] Testes passam (`pnpm test`)
- [ ] Coverage mantido ou melhorado
- [ ] Commits seguem conventional commits
- [ ] Documentação atualizada (se necessário)
- [ ] Branch atualizada com main

### **Descrição do PR**
```markdown
## 📋 Descrição
Breve descrição das mudanças

## 🔄 Tipo de Mudança
- [ ] Bug fix
- [ ] Nova funcionalidade
- [ ] Breaking change
- [ ] Documentação
- [ ] Refatoração

## ✅ Checklist
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Linting passou
- [ ] Coverage mantido

## 🧪 Como Testar
Instruções para testar as mudanças
```

## 🏗️ Adicionando Novos Projetos

### **Aplicação React**
```bash
nx g @nx/react:app minha-app --unitTestRunner=jest
```

### **Aplicação Next.js**
```bash
nx g @nx/next:app minha-app --unitTestRunner=jest
```

### **Aplicação NestJS**
```bash
nx g @nx/nest:app minha-api --unitTestRunner=jest
```

### **Biblioteca**
```bash
nx g @nx/react:lib minha-lib --unitTestRunner=jest
```

## 🔍 Code Review

### **Como Revisar**
1. **Funcionalidade**: O código faz o que deveria?
2. **Qualidade**: Código limpo e bem estruturado?
3. **Testes**: Cobertura adequada?
4. **Performance**: Mudanças não degradam performance?
5. **Segurança**: Não introduz vulnerabilidades?

### **Comentários**
- Seja construtivo e educacional
- Explique o "porquê", não apenas o "o que"
- Sugira melhorias específicas
- Reconheça boas práticas

## 🐛 Reportando Bugs

### **Template de Bug Report**
```markdown
## 🐛 Descrição
Descrição clara do problema

## 🔄 Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Veja o erro

## ✅ Comportamento Esperado
O que deveria acontecer

## 📸 Screenshots
Se aplicável

## 🔧 Ambiente
- OS: [e.g. Ubuntu 22.04]
- Node: [e.g. v20.10.0]
- pnpm: [e.g. v8.15.0]
```

## 💡 Sugerindo Features

### **Template de Feature Request**
```markdown
## 💡 Descrição
Descrição clara da funcionalidade

## 🎯 Problema
Que problema isso resolve?

## 💭 Solução Proposta
Como você imagina que funcionaria?

## 🔄 Alternativas
Outras soluções consideradas?
```

## 📋 Scripts NPM

### Scripts Essenciais
```json
{
  "scripts": {
    "lint": "nx affected --target=biome:lint",
    "lint:fix": "nx affected --target=biome:lint-fix",
    "format": "nx affected --target=biome:format",
    "format:fix": "nx affected --target=biome:format-fix",
    "check": "nx affected --target=biome:check",
    "check:fix": "nx affected --target=biome:check-fix",
    "test": "nx affected --target=test",
    "test:go": "nx affected --target=go:test",
    "test:affected": "nx affected --target=test && nx affected --target=go:test",
    "test:all": "nx run-many --target=test",
    "graph": "nx graph",
    "show:projects": "nx show projects",
    "show:affected": "nx show projects --affected"
  }
}
```

## 🔧 Configuração de Projetos

### Projetos JavaScript/TypeScript
```json
{
  "targets": {
    "test": {
      "executor": "nx:run-commands",
      "options": {
        "command": "jest",
        "cwd": "apps/<app-name>"
      },
      "outputs": ["{projectRoot}/coverage"]
    },
    "test-coverage": {
      "executor": "nx:run-commands",
      "options": {
        "command": "jest --coverage",
        "cwd": "apps/<app-name>"
      },
      "outputs": ["{projectRoot}/coverage"]
    },
    "lint": {
      "executor": "nx:run-commands",
      "options": {
        "command": "biome check src/",
        "cwd": "apps/<app-name>"
      }
    }
  }
}
```

### Projetos Go
```json
{
  "targets": {
    "test": {
      "executor": "@nx-go/nx-go:test"
    },
    "test-coverage": {
      "executor": "@nx-go/nx-go:test",
      "options": {
        "cover": true,
        "coverProfile": "coverage.out"
      },
      "outputs": ["{projectRoot}/coverage"]
    },
    "lint": {
      "executor": "@nx-go/nx-go:lint"
    }
  }
}
```

## 🎯 Boas Práticas

### Desenvolvimento
1. **Use comandos afetados**: `pnpm lint`, `pnpm test`
2. **Mantenha coverage alto**: Meta de 60%
3. **Execute linting antes de commitar**
4. **Use cache do Nx**: Não force `--skip-nx-cache` desnecessariamente

### CI/CD
1. **Use `nx affected`** em pipelines
2. **Configure cache remoto** para equipe
3. **Execute testes em paralelo**
4. **Monitore tempo de execução**

### Troubleshooting
```bash
# Limpar cache
nx reset

# Forçar execução
nx run-many --target=test --all --skip-nx-cache

# Debug projetos afetados
nx show projects --affected --verbose
```

## 📚 Recursos Adicionais

- [Documentação Nx](https://nx.dev)
- [Biome Documentation](https://biomejs.dev)
- [Jest Documentation](https://jestjs.io)
- [Go Testing](https://golang.org/pkg/testing/)
- [Nx Affected Commands](https://nx.dev/nx-api/nx/documents/affected)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

## 🏆 Reconhecimento

Contribuidores são reconhecidos no README e releases. Obrigado por contribuir! 🎉

---

**💡 Dica**: Pequenas contribuições são muito bem-vindas! Não hesite em abrir PRs para correções de typos, melhorias na documentação, etc.