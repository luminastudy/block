import agentConfig from 'eslint-config-agent'

export default [
  ...agentConfig,
  {
    ignores: ['node_modules/**', '*.config.js', '*.config.mjs', 'coverage/**'],
  },
  {
    files: ['package.json'],
    rules: {
      // Package.json specific rules will be handled by eslint-config-publishable-package-json
    },
  },
]
