import agentConfig from 'eslint-config-agent'

export default [
  ...agentConfig,
  {
    ignores: ['node_modules/**', '*.config.js', '*.config.mjs', 'coverage/**'],
  },
  {
    files: ['scripts/**/*.js'],
    rules: {
      'single-export/single-export': 'off',
      'default/no-default-params': 'off',
    },
  },
  {
    files: ['package.json'],
    rules: {
      // Package.json specific rules will be handled by eslint-config-publishable-package-json
    },
  },
]
