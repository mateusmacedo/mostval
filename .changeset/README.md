# Changesets - Mostval

Este diretório contém a configuração do Changeset para versionamento e release dos projetos do monorepo.

## 🚀 Como Usar

### 1. Criar um Changeset
Quando você fizer mudanças que afetam a versão de um projeto:

```bash
pnpm changeset:add
```

Isso abrirá um prompt interativo onde você pode:
- Selecionar quais projetos foram afetados
- Escolher o tipo de mudança (patch, minor, major)
- Escrever uma descrição da mudança

### 2. Verificar Status
Para ver quais changesets estão pendentes:

```bash
pnpm changeset:status
```

### 3. Aplicar Versionamento
Para aplicar as versões definidas nos changesets:

```bash
pnpm changeset:version
```

### 4. Publicar
Para publicar as novas versões:

```bash
pnpm changeset:publish
```

### 5. Workflow Completo
Para executar o workflow completo (version + publish):

```bash
pnpm release:changeset
```

## 📋 Projetos Configurados

Os seguintes projetos estão configurados para versionamento:

- `@mostval/node-logger` (privado)
- `@mostval/go-logger` (privado)
- `@mostval/go-api` (privado)
- `@mostval/node-auth` (privado)

## 🔧 Integração com Nx

O Changeset está integrado com o Nx Release existente:

- **Changeset**: Gerencia versionamento e changelog
- **Nx Release**: Gerencia build e publish
- **Workflow híbrido**: Combina o melhor dos dois sistemas

## 📝 Convenções

### Tipos de Mudança
- **patch**: Correções de bugs, mudanças menores
- **minor**: Novas funcionalidades, mudanças compatíveis
- **major**: Mudanças que quebram compatibilidade

### Descrições
- Seja claro e descritivo
- Use linguagem técnica
- Mencione impactos importantes
- Inclua exemplos quando relevante

## 🚨 Importante

- Sempre crie um changeset para mudanças que afetam a versão
- Teste localmente antes de publicar
- Use `pnpm changeset:status` para verificar mudanças pendentes
- O workflow completo inclui build automático via Nx

## 📚 Documentação

- [Changesets Documentation](https://github.com/changesets/changesets)
- [Nx Release Documentation](https://nx.dev/recipes/nx-release)