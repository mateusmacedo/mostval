# Configuração do SonarQube no Workspace Nx

Este documento descreve como configurar e usar o SonarQube no workspace Nx, incluindo suporte para projetos TypeScript/JavaScript e Go.

## 📋 Pré-requisitos

- Node.js 18+
- pnpm
- SonarQube Server (Community ou Enterprise)
- Token de acesso ao SonarQube

## 🚀 Configuração Inicial

### 1. Configuração do Arquivo .env

Copie o arquivo de exemplo e configure as variáveis:

```bash
# Copiar arquivo de exemplo
cp docs/env.example .env

# Editar o arquivo .env
nano .env
```

Configure as seguintes variáveis no arquivo `.env`:

```bash
# URL do servidor SonarQube
SONAR_HOST_URL=http://localhost:9000
# ou para SonarCloud
# SONAR_HOST_URL=https://sonarcloud.io

# Token de acesso (gerado no SonarQube)
SONAR_TOKEN=seu_token_aqui

# Organização (opcional, para SonarCloud)
SONAR_ORGANIZATION=mostval

# Projeto (opcional, para SonarCloud)
SONAR_PROJECT_KEY=mostval
```

### 2. Executar Script de Configuração

```bash
./scripts/setup-sonar.sh
```

## 📁 Estrutura de Configuração

O workspace possui as seguintes configurações do SonarQube:

- `sonar-project.properties` - Configuração principal (análise completa)
- `sonar-apps.properties` - Configuração para aplicações
- `sonar-libs.properties` - Configuração para bibliotecas
- `sonar-go.properties` - Configuração para projetos Go

## 🎯 Comandos Disponíveis

### Análise Completa
```bash
pnpm sonar:scan
```

### Análise por Categoria
```bash
# Apenas aplicações (incluindo Go em apps/)
pnpm sonar:scan:apps

# Apenas bibliotecas (incluindo Go em libs/)
pnpm sonar:scan:libs
```

## 🔧 Configurações Específicas

### TypeScript/JavaScript
- Suporte a arquivos `.ts`, `.tsx`, `.js`, `.jsx`
- Análise de cobertura com LCOV
- Exclusão de arquivos de teste e build

### Go
- Suporte a arquivos `.go` em `apps/` e `libs/`
- Análise de cobertura Go
- Exclusão de arquivos de teste (`*_test.go`)
- Integrado nas configurações de apps e libs

### Exclusões Padrão
- `node_modules/`
- `dist/`, `build/`
- `coverage/`
- `tmp/`, `.nx/`
- `e2e/`
- `vendor/` (Go)
- Arquivos de teste (`*.spec.ts`, `*.test.ts`, `*_test.go`, `*.test.go`)

## 🚀 CI/CD Integration

### GitHub Actions

O workflow `.github/workflows/sonar.yml` está configurado para:

- Executar análise em push para `main` e `develop`
- Executar análise em pull requests
- **Setup completo**: Node.js, Go, pnpm
- **Testes**: TypeScript/JavaScript e Go
- **Build**: TypeScript/JavaScript e Go
- Suporte a triggers específicos via commit messages:
  - `[sonar:apps]` - Análise apenas de apps (incluindo Go em apps/)
  - `[sonar:libs]` - Análise apenas de libs (incluindo Go em libs/)

### Secrets Necessários

Configure os seguintes secrets no GitHub:

- `SONAR_TOKEN` - Token de acesso ao SonarQube
- `SONAR_HOST_URL` - URL do servidor SonarQube
- `SONAR_ORGANIZATION` - Organização (opcional, para SonarCloud)
- `SONAR_PROJECT_KEY` - Chave do projeto (opcional, para SonarCloud)

## 📊 Relatórios de Cobertura

### TypeScript/JavaScript
```bash
# Gerar cobertura antes da análise
pnpm test:affected
```

### Go
```bash
# Gerar cobertura Go antes da análise
pnpm test:go
```

## 🎛️ Configurações Avançadas

### Personalizar Exclusões

Edite os arquivos `.properties` para ajustar exclusões:

```properties
# Excluir diretórios específicos
sonar.exclusions=**/vendor/**,**/third-party/**

# Excluir arquivos específicos
sonar.exclusions=**/*.generated.ts,**/*.d.ts
```

### Configurar Quality Gates

```properties
# Aguardar quality gate
sonar.qualitygate.wait=true
```

## 🔍 Troubleshooting

### Erro: "sonar-scanner not found"
```bash
pnpm add -D sonar-scanner
```

### Erro: "SONAR_TOKEN not defined"
```bash
# Adicione ao arquivo .env
echo "SONAR_TOKEN=seu_token_aqui" >> .env
```

### Erro: "SONAR_HOST_URL not defined"
```bash
# Adicione ao arquivo .env
echo "SONAR_HOST_URL=http://localhost:9000" >> .env
```

### Erro: "Arquivo .env não encontrado"
```bash
# Copie o arquivo de exemplo
cp docs/env.example .env
# Edite o arquivo .env com suas configurações
nano .env
```

## 📈 Monitoramento

### Métricas Analisadas

- **Cobertura de Código** - Percentual de linhas testadas
- **Duplicação** - Código duplicado
- **Complexidade Ciclomática** - Complexidade do código
- **Code Smells** - Problemas de qualidade
- **Bugs** - Problemas funcionais
- **Vulnerabilidades** - Problemas de segurança

### Quality Gates

O workspace está configurado para aguardar o quality gate:

```properties
sonar.qualitygate.wait=true
```

## 🎯 Próximos Passos

1. Configure seu servidor SonarQube
2. Copie o arquivo de exemplo: `cp docs/env.example .env`
3. Configure as variáveis no arquivo `.env`
4. Execute `./scripts/setup-sonar.sh`
5. Teste com `pnpm sonar:scan`
6. Configure os secrets no GitHub
7. Monitore as métricas no SonarQube

## 📚 Recursos Adicionais

- [Documentação SonarQube](https://docs.sonarqube.org/)
- [SonarQube Scanner](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
- [Nx Documentation](https://nx.dev/)
