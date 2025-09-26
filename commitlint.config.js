module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Padrão customizado: <emoji> <type>(<scope>): <header 120chars-max>
    'type-enum': [
      2,
      'always',
      [
        'feat', // ✨ Nova funcionalidade
        'fix', // 🐛 Correção de bug
        'docs', // 📚 Documentação
        'style', // 💄 Formatação, sem mudança de código
        'refactor', // ♻️ Refatoração de código
        'perf', // ⚡ Melhoria de performance
        'test', // ✅ Adição ou correção de testes
        'build', // 📦 Mudanças no sistema de build
        'ci', // 🔧 Mudanças na CI/CD
        'chore', // 🔨 Tarefas de manutenção
        'revert', // ⏪ Reverter commit anterior
        'wip', // 🚧 Work in progress
        'release', // 🚀 Release
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-max-length': [2, 'always', 120],
    'subject-min-length': [2, 'always', 10],
    'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [2, 'never'],
    'scope-min-length': [2, 'always', 2],
    'scope-max-length': [2, 'always', 20],
    'scope-enum': [
      2,
      'always',
      [
        // Projetos Nx
        'source', // Projeto Source
        'docs', // Projeto Docs
        'release', // Projeto Release
        'node-logger', // Projeto Node Logger
        'biome', // Projeto Biome
        'tsconfig', // Projeto Tsconfig
        // Escopos funcionais
        'api', // API endpoints
        'auth', // Autenticação
        'ui', // Interface do usuário
        'db', // Banco de dados
        'config', // Configurações
        'deps', // Dependências
        'readme', // README
        'test', // Testes
        'ci', // CI/CD
        'deploy', // Deploy
        'infra', // Infraestrutura
        'monitoring', // Monitoramento
        'security', // Segurança
        'performance', // Performance
        'accessibility', // Acessibilidade
        'i18n', // Internacionalização
        'seo', // SEO
        'analytics', // Analytics
        'logging', // Logs
        'cache', // Cache
        'storage', // Armazenamento
        'network', // Rede
        'validation', // Validação
        'error', // Tratamento de erros
        'migration', // Migração
        'backup', // Backup
        'recovery', // Recuperação
        'cleanup', // Limpeza
        'optimization', // Otimização
        'refactor', // Refatoração
        'maintenance', // Manutenção
      ],
    ],
    'header-max-length': [2, 'always', 120],
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
    'emoji-required': [2, 'always'],
    'emoji-type-format': [2, 'always'],
    'scope-required': [2, 'always'],
  },
  plugins: [
    {
      rules: {
        'emoji-required': ({ header }) => {
          // Verifica se o header começa com um emoji (regex mais abrangente)
          const emojiRegex = /^[\u{1F000}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/u;
          return [emojiRegex.test(header), 'Header deve começar com um emoji'];
        },
        'emoji-type-format': ({ header }) => {
          // Verifica o formato: <emoji> <type>(<scope>): <description>
          const formatRegex = /^[\u{1F000}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]\s+\w+\([a-z-]+\):\s+.+$/u;
          return [
            formatRegex.test(header),
            'Formato deve ser: <emoji> <type>(<scope>): <description>',
          ];
        },
        'scope-required': ({ header }) => {
          // Verifica se tem escopo entre parênteses
          const scopeRegex = /\([a-z-]+\)/;
          return [scopeRegex.test(header), 'Escopo é obrigatório entre parênteses'];
        },
      },
    },
  ],
  parserPreset: {
    parserOpts: {
      headerPattern: /^([\u{1F000}-\u{1F9FF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}])\s+(\w+)\(([^)]+)\):\s+(.*)$/u,
      headerCorrespondence: ['emoji', 'type', 'scope', 'subject'],
    },
  },
};
