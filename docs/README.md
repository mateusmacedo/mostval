# Documentação - Workspace Nx

Bem-vindo à documentação do workspace Nx. Este workspace está configurado com ambiente completo de desenvolvimento para JavaScript/TypeScript e Go.

## 📁 Estrutura do Workspace

```
workspace/
├── apps/                    # Aplicações
├── libs/                   # Bibliotecas compartilhadas
├── scripts/                # Scripts essenciais
└── docs/                   # Documentação
```

## 🚀 Comandos Essenciais

### Linting
```bash
# Lint de projetos afetados (recomendado)
pnpm lint

# Lint com correção automática
pnpm lint:fix

# Formatação
pnpm format
pnpm format:fix

# Verificação completa
pnpm check
pnpm check:fix

# Lint de todos os projetos
nx run-many --target=biome:lint --all
```

### Testes
```bash
# Testes de projetos afetados (recomendado)
pnpm test

# Coverage automático com testes (recomendado)
pnpm test                    # Coverage automático

# Testes Go com coverage
pnpm test:go

# Testes completos (JS/TS + Go)
pnpm test:affected          # Projetos afetados
pnpm test:all               # Todos os projetos

# Comandos Nx
nx test                      # Testes via Nx
nx affected --target=test    # Testes de projetos afetados
nx run-many --target=test --all  # Todos os projetos
```

### Análise
```bash
# Grafo de dependências
pnpm graph

# Projetos afetados
pnpm show:affected

# Projetos disponíveis
nx show projects
```

## 🛠️ Ferramentas Configuradas

### Linting
- **Biome**: JavaScript/TypeScript (configurado para NestJS)
  - Linting, formatação e verificação em uma ferramenta
  - Integração completa com Nx
- **golangci-lint**: Go (opcional)
- **Integração Nx**: Comandos automáticos por projeto

### Testes
- **Jest**: JavaScript/TypeScript com coverage automático
- **go test**: Go com coverage
- **Configuração centralizada**: Jest no root com `getJestProjects()`
- **Coverage centralizado**: Diretório único no root
- **Thresholds**: 60% para branches, functions, lines, statements
- **Plugins Nx**: Configurados para Jest

### Integração Nx
- **Comandos afetados**: Executa apenas em projetos modificados
- **Cache inteligente**: Reutiliza resultados quando possível
- **Paralelização**: Execução otimizada

## 📊 Coverage Atual

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

## 🎯 Estado Atual do Workspace

Este workspace está configurado como **template** e contém:

- ✅ **Projeto source**: `@mostval/source` (workspace root)
- ✅ **Configuração Jest centralizada** no root
- ✅ **Plugins Nx** configurados para Jest, Biome, Go
- ✅ **Scripts de desenvolvimento** no package.json
- ✅ **Sistema de release** configurado
- ✅ **Configuração Biome** para linting
- ✅ **Configuração Go** para testes Go

## 🔧 Configuração

### Biome (JavaScript/TypeScript)
- Configurado para NestJS com decorators
- Formatação automática
- Linting com regras recomendadas

### Jest (JavaScript/TypeScript)
- **Configuração centralizada** no root com `getJestProjects()`
- **Coverage automático** com thresholds de 60%
- **Relatórios HTML, LCOV, JSON, JUnit**
- **Performance otimizada** (cache, workers, SWC)
- **CI/CD ready** com configurações específicas
- **Plugins Nx** configurados para Jest

### Go
- `go test` com coverage
- Relatórios HTML e texto
- Integração com JUnit

## 📚 Recursos Adicionais

- [Documentação Nx](https://nx.dev)
- [Biome Documentation](https://biomejs.dev)
- [Jest Documentation](https://jestjs.io)
- [Go Testing](https://golang.org/pkg/testing/)

## 🤝 Contribuindo

1. Use `pnpm lint` antes de commitar
2. Execute `pnpm test` para verificar coverage
3. Siga as convenções de commit configuradas
4. Mantenha a documentação atualizada

## 📝 Changelog

- **v1.0.0-rc**: Configuração inicial do ambiente