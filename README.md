# Mostaval

Bem-vindo ao monorepo Mostaval, gerenciado pelo [Nx](https://nx.dev), uma poderosa suíte de ferramentas de construção que ajuda a escalar aplicações e bibliotecas com eficiência.

<img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="100">

Este repositório contém várias aplicações e bibliotecas interconectadas, facilitando o compartilhamento de código e a redução de redundâncias.

## Começando

### Pré-requisitos

Antes de começar, certifique-se de ter o Node.js instalado em sua máquina. Nx suporta a versão LTS mais recente.

### Instalação

Para configurar o ambiente de desenvolvimento, siga estes passos:

1. Clone o repositório:
   ```sh
   git clone https://example.com/mostval.git
   cd mostval
   ```

2. Instale as dependências:
   ```sh
   npm install
   ```

3. Execute uma aplicação específica:
   ```sh
   npx nx serve nome-da-aplicacao
   ```

## Estrutura do Projeto

Este monorepo inclui as seguintes aplicações e bibliotecas:

- **Aplicações:**
  - `nest-api-users`: Uma API REST construída com NestJS para gerenciamento de usuários.

- **Bibliotecas:**
  - `@mostval/common`: Biblioteca comum contendo utilitários e helpers usados por várias aplicações.
  - `@mostval/ddd`: Biblioteca para implementação de arquitetura DDD.
  - `@mostval/iam`: Biblioteca para implementação de autenticação e autorização.
  - `@mostval/nestjs-utils`: Biblioteca para implementação de utilitários para NestJS.
  - `@mostval/pipeline`: Biblioteca para implementação de pipelines de processamento de dados.
  - `@mostval/shared`: Biblioteca para implementação de utilitários compartilhados entre aplicações.
  - `@mostval/users`: Biblioteca para implementação de contexto de usuários.

## Características

- **Escalabilidade:** Gerencie facilmente múltiplas aplicações e bibliotecas.
- **Eficiência:** Compartilhamento de código entre projetos para evitar redundâncias.
- **Flexibilidade:** Adapte as configurações para atender às necessidades do seu projeto.

## Tarefas Comuns

### Executar Testes

Para executar testes em todo o projeto:
```sh
npx nx test
```

### Construir um Projeto

Para construir um projeto específico e todas as suas dependências:
```sh
npx nx build nome-do-projeto
```

### Adicionar uma Nova Biblioteca

Para adicionar uma nova biblioteca ao workspace:
```sh
npx nx g @nrwl/js:lib nome-da-lib
```

## Contribuindo

Contribuições são sempre bem-vindas! Se você tem uma sugestão que poderia melhorar este projeto, siga nosso guia de contribuição em `CONTRIBUTING.md` e envie um pull request. Agradecemos todas as contribuições, grandes ou pequenas!

## Links Úteis

- [Documentação Nx](https://nx.dev)
- [Nx no GitHub](https://github.com/nrwl/nx)
- [Comunidade Nx no Discord](https://go.nx.dev/community)

---

Este projeto é licenciado sob a MIT License - veja o arquivo `LICENSE` para mais detalhes.
