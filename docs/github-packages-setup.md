# Configuração do GitHub Packages

Este documento explica como o projeto está configurado para usar o GitHub Packages como registro npm.

## Visão Geral

O GitHub Packages permite publicar e gerenciar pacotes npm diretamente no GitHub, integrando com o workflow de CI/CD existente.

## Configuração Implementada

### 1. Autenticação

O workflow de release está configurado para usar o `GITHUB_TOKEN` para autenticação:

```yaml
# .github/workflows/release.yml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: 20
    registry-url: 'https://npm.pkg.github.com'
    scope: '@mateusmacedo'
```

### 2. Configuração do Registro

Arquivo `.npmrc.github` contém a configuração do registro:

```ini
# Registro do GitHub Packages para o escopo @mateusmacedo
@mateusmacedo:registry=https://npm.pkg.github.com

# Configurações de autenticação
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

### 3. Publicação Automática

O script `scripts/release-integrated.js` foi atualizado para:

1. Executar `pnpm changeset version` para versionar pacotes
2. Executar `pnpm changeset publish` para publicar no GitHub Packages
3. Criar tags Git para cada versão publicada

## Como Usar

### Publicar Pacotes

1. **Criar Changeset:**
   ```bash
   pnpm changeset add
   ```

2. **Executar Release:**
   ```bash
   pnpm release:integrated
   ```

3. **Verificar Publicação:**
   - Acesse: https://github.com/mateusmacedo/mostval/packages
   - Os pacotes aparecerão com escopo `@mateusmacedo`

### Instalar Pacotes

Para instalar pacotes publicados no GitHub Packages:

1. **Configurar .npmrc local:**
   ```ini
   @mateusmacedo:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=SEU_TOKEN
   ```

2. **Instalar pacote:**
   ```bash
   pnpm add @mateusmacedo/nome-do-pacote
   ```

## Configuração de Desenvolvimento Local

### Para Desenvolvedores

1. **Criar Personal Access Token:**
   - Acesse: GitHub Settings > Developer settings > Personal access tokens
   - Criar token com escopo `read:packages` e `write:packages`

2. **Configurar .npmrc local:**
   ```bash
   cp .npmrc.github .npmrc
   # Editar .npmrc e substituir ${NODE_AUTH_TOKEN} pelo seu token
   ```

3. **Testar Publicação Local:**
   ```bash
   pnpm changeset add
   pnpm changeset version
   pnpm changeset publish
   ```

## Estrutura de Pacotes

### Escopo

Todos os pacotes são publicados com escopo `@mateusmacedo`:

- `@mostval/tsconfig` → `@mateusmacedo/tsconfig`
- `@mostval/shared` → `@mateusmacedo/shared`

### Versionamento

- Usa [Semantic Versioning](https://semver.org/)
- Versões são gerenciadas pelo Changeset
- Tags Git são criadas automaticamente

## Troubleshooting

### Erro de Autenticação

```
npm ERR! code E401
npm ERR! Unable to authenticate, need: Basic realm="GitHub Package Registry"
```

**Solução:**
1. Verificar se o token tem escopos corretos
2. Verificar se o escopo está configurado corretamente
3. Verificar se o arquivo .npmrc está correto

### Erro de Permissão

```
npm ERR! code E403
npm ERR! Forbidden
```

**Solução:**
1. Verificar se o token tem permissão `write:packages`
2. Verificar se o repositório tem permissão para publicar
3. Verificar se o pacote não está duplicado

### Erro de Escopo

```
npm ERR! code E400
npm ERR! Invalid package name
```

**Solução:**
1. Verificar se o nome do pacote tem escopo correto
2. Verificar se o package.json tem o campo `repository` correto
3. Verificar se o escopo corresponde ao namespace do GitHub

## Referências

- [GitHub Packages - npm Registry](https://docs.github.com/pt/packages/working-with-a-github-packages-registry/working-with-the-npm-registry)
- [Changeset Documentation](https://github.com/changesets/changesets)
- [Nx Release Documentation](https://nx.dev/nx-api/nx/documents/release)
