# Workspace Nx

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Workspace Nx configurado com ambiente completo de desenvolvimento para JavaScript/TypeScript e Go ✨

[![GitHub](https://img.shields.io/badge/GitHub-workspace-blue?style=flat-square&logo=github)](https://github.com/your-org/your-workspace)
[![Nx](https://img.shields.io/badge/Nx-20.8.2-blue?style=flat-square&logo=nx)](https://nx.dev)

## 📚 Documentação

A documentação completa está disponível em [docs/](docs/):

### 🚀 Início Rápido
- **[GETTING_STARTED](docs/GETTING_STARTED.md)**: Guia de início rápido

### 🛠️ Desenvolvimento
- **[CONTRIBUTING](docs/CONTRIBUTING.md)**: Guia completo de desenvolvimento e contribuição
- **[ARCHITECTURE](docs/ARCHITECTURE.md)**: Arquitetura do workspace

### 🚀 Release e Versionamento
- **[RELEASE](docs/RELEASE.md)**: Sistema completo de release e versionamento

## 🚀 Comandos Rápidos

### Linting
```bash
pnpm lint              # Lint de projetos afetados
pnpm lint:fix          # Lint com correção automática
pnpm format            # Formatação
pnpm format:fix        # Formatação com correção
pnpm check             # Verificação completa
pnpm check:fix         # Verificação com correção
```

### Testes
```bash
pnpm test              # Testes de projetos afetados (com coverage automático)
pnpm test:go           # Testes Go com coverage
pnpm test:affected     # JS/TS + Go (projetos afetados)
pnpm test:all          # JS/TS + Go (todos os projetos)
```

### Análise
```bash
pnpm graph             # Grafo de dependências
pnpm show:affected     # Projetos afetados
```

### 🚀 Lançamentos
```bash
# Nx Release (recomendado)
./scripts/release.sh dry-run                    # Verificar o que será lançado
./scripts/release.sh full                       # Lançar todos os projetos
./scripts/release.sh full <project-name>  # Lançar projeto específico

# Changeset (alternativo)
pnpm changeset:add                             # Criar changeset
pnpm changeset:status                          # Verificar status
pnpm changeset:version                         # Aplicar versionamento
pnpm release:changeset                         # Build e publish
```

## 🔧 Ferramentas Configuradas

### Linting
- **Biome**: JavaScript/TypeScript (configurado para NestJS)
  - Linting, formatação e verificação em uma ferramenta
  - Integração completa com Nx
- **golangci-lint**: Go (opcional)
- **Integração Nx**: Comandos automáticos por projeto

### Testes
- **Jest**: JavaScript/TypeScript com coverage automático
- **go test**: Go com coverage
- **Coverage por projeto**: Cada projeto tem seu próprio coverage
- **Thresholds**: 60% para branches, functions, lines, statements

### Integração Nx
- **Comandos afetados**: Executa apenas em projetos modificados
- **Cache inteligente**: Reutiliza resultados quando possível
- **Paralelização**: Execução otimizada

## 🎯 Comandos Nx

### Projetos
```bash
nx show projects                    # Listar todos os projetos
nx show projects --affected        # Projetos afetados
nx graph                           # Grafo de dependências
```

### Execução
```bash
nx affected --target=biome:lint    # Lint de projetos afetados
nx affected --target=test          # Testes de projetos afetados
nx affected --target=go:test       # Testes Go de projetos afetados
nx run-many --target=biome:lint --all    # Todos os projetos
```

### Projeto Específico
```bash
nx affected --target=biome:lint <project-name>
nx test <project-name>
nx test <project-name>
```

## 🔗 Links Úteis

- **Repositório**: [https://github.com/your-org/your-workspace](https://github.com/your-org/your-workspace)
- **Issues**: [https://github.com/your-org/your-workspace/issues](https://github.com/your-org/your-workspace/issues)
- **Documentação Nx**: [https://nx.dev](https://nx.dev)
- **Biome**: [https://biomejs.dev](https://biomejs.dev)
- **Jest**: [https://jestjs.io](https://jestjs.io)

## 🤝 Contribuindo

1. Use `pnpm lint` antes de commitar
2. Execute `pnpm test` para verificar coverage
3. Siga as convenções de commit configuradas
4. Mantenha a documentação atualizada

## 📝 Changelog

- **v1.0.0**: Template inicial do workspace Nx

---

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/js?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created.