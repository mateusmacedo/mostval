/** @type {import('@changesets/types').Config} */
module.exports = {
  // Versionamento independente para cada projeto
  version: {
    type: 'independent'
  },

  // Changelog por projeto
  changelog: {
    type: 'project'
  },

  // Configurações de build
  build: 'nx run-many -t build',

  // Configurações de Git
  git: {
    commit: true,
    tag: true,
    push: true,
    commitMessage: '🔨 chore(release): publish {version}',
    tagMessage: 'v{version}',
    tagPattern: '{projectName}@{version}'
  },

  // Configurações de acesso
  access: 'public',

  // Branch base
  baseBranch: 'main',

  // Atualização de dependências internas
  updateInternalDependencies: 'patch',

  // Projetos a ignorar
  ignore: [
    '@mostval/source'
  ],

  // Opções experimentais
  ___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH: {
    onlyUpdatePeerDependentsWhenOutOfRange: true
  }
};
