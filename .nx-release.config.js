/** @type {import('nx-release').NxReleaseConfig} */
module.exports = {
  // Configurações de versionamento
  version: {
    // Usar affected para performance
    preVersionCommand: 'nx affected -t build test',
    // Resolver versão atual
    currentVersionResolver: 'git-tag',
    // Usar conventional commits
    specifierSource: 'conventional-commits',
    // Fallback para versão em disco
    fallbackCurrentVersionResolver: 'disk'
  },

  // Configurações de changelog
  changelog: {
    // Changelog por projeto
    projectChangelogs: true,
    // Sem changelog do workspace
    workspaceChangelog: false,
    // Referência automática
    automaticFromRef: 'HEAD',
    // Cabeçalho do changelog
    changelogHeader: '# Changelog\n\nAll notable changes to this project will be documented in this file.'
  },

  // Configurações do Git
  git: {
    commit: true,
    tag: true,
    push: true,
    commitMessage: 'chore(release): publish {version}',
    tagMessage: 'v{version}',
    tagPattern: '{projectName}@{version}'
  },

  // Configurações do GitHub
  github: {
    repo: 'mostval/mostval'
  },

  // Configurações de release
  release: {
    // Versionamento independente
    projectsRelationship: 'independent',
    // Projetos a incluir (vazio = todos)
    projects: [],
    // Comando de build
    build: 'nx affected -t build',
    // Comando de test
    test: 'nx affected -t test'
  },

  // Configurações de publicação
  publish: {
    // Publicar no GitHub Packages
    registry: 'https://npm.pkg.github.com',
    // Escopo para GitHub Packages
    scope: '@mateusmacedo',
    // Comando de publicação
    command: 'pnpm publish --access public'
  }
};
