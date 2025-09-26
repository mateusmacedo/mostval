# 🚀 Guia de Início Rápido

Bem-vindo ao workspace Nx! Este guia te ajudará a começar rapidamente.

## 📋 Pré-requisitos

- **Node.js**: v18+ (recomendado v20+)
- **pnpm**: v8+ (gerenciador de pacotes)
- **Git**: Para controle de versão
- **Go**: v1.21+ (opcional, para projetos Go)

## ⚡ Instalação Rápida

### 1. Clone o Repositório
```bash
git clone <repository-url>
cd <workspace-name>
```

### 2. Instale Dependências
```bash
pnpm install
```

### 3. Verifique a Instalação
```bash
# Verificar workspace
nx show projects

# Executar testes
pnpm test

# Executar linting
pnpm lint
```

## 🎯 Primeiros Passos

### Comandos Essenciais
```bash
# Linting (sempre execute antes de commitar)
pnpm lint
pnpm lint:fix

# Testes
pnpm test
pnpm test:go

# Análise do workspace
pnpm graph
pnpm show:affected
```

### Estrutura do Workspace
```
workspace/
├── apps/                    # Aplicações
├── libs/                   # Bibliotecas compartilhadas
├── scripts/                # Scripts essenciais
├── docs/                   # Documentação
├── jest.config.js          # Configuração Jest
├── biome.json             # Configuração Biome
└── nx.json                 # Configuração Nx
```

## 🛠️ Ferramentas Configuradas

### **Linting & Formatação**
- **Biome**: JavaScript/TypeScript (linting + formatação)
- **golangci-lint**: Go (opcional)

### **Testes**
- **Jest**: JavaScript/TypeScript com coverage
- **go test**: Go com coverage
- **Coverage centralizado** no root

### **Desenvolvimento**
- **Nx**: Monorepo com cache inteligente
- **pnpm**: Gerenciador de pacotes rápido
- **Conventional Commits**: Padrão de commits

## 🚀 Próximos Passos

1. **Explore o workspace**: `nx show projects`
2. **Execute testes**: `pnpm test`
3. **Veja o grafo**: `pnpm graph`
4. **Leia a documentação**: [docs/](docs/)

## 📚 Documentação Completa

- **[DEVELOPMENT.md](DEVELOPMENT.md)**: Guia completo de desenvolvimento
- **[RELEASE.md](RELEASE.md)**: Sistema de release e versionamento
- **[ARCHITECTURE.md](ARCHITECTURE.md)**: Arquitetura do workspace
- **[CONTRIBUTING.md](CONTRIBUTING.md)**: Guia de contribuição

## 🆘 Precisa de Ajuda?

- **Documentação Nx**: [https://nx.dev](https://nx.dev)
- **Biome**: [https://biomejs.dev](https://biomejs.dev)
- **Jest**: [https://jestjs.io](https://jestjs.io)

---

**💡 Dica**: Comece sempre com `pnpm lint` e `pnpm test` para verificar se tudo está funcionando!
