const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const globals = require('globals');
const noRedux = require('./eslint-plugin-custom-rules/rules/no-redux.js');

module.exports = [
  {
    ignores: ['**/.next/**', '**/.dist/**', '**/wwwroot/lib/**', 'eslint.config.js', 'eslint-plugin-custom-rules/rules/no-redux.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: require('@typescript-eslint/parser'),
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'custom-rules': { rules: { 'no-redux': noRedux } },
      import: require('eslint-plugin-import'),
      promise: require('eslint-plugin-promise'),
      'unused-imports': require('eslint-plugin-unused-imports'),
      react: require('eslint-plugin-react'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      next: require('@next/eslint-plugin-next'),
      security: require('eslint-plugin-security'),
      'no-secrets': require('eslint-plugin-no-secrets'),
      'jsdoc': require('eslint-plugin-jsdoc'),
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'react/function-component-definition': ['error', { namedComponents: 'arrow-function' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'after-used', vars: 'all' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      'next/no-img-element': 'warn',
      'next/no-document-import-in-page': 'error',
      'next/no-head-element': 'error',
      'next/next-script-for-ga': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-object-injection': 'error',
      'no-secrets/no-secrets': 'error',
      'custom-rules/no-redux': 'warn',
      'import/order': ['error', { groups: ['builtin', 'external', 'internal'], 'newlines-between': 'always', alphabetize: { order: 'asc' } }],
      'unused-imports/no-unused-imports': 'warn',
      'unused-imports/no-unused-vars': ['warn', { vars: 'all', args: 'after-used' }],
      'promise/prefer-await-to-then': 'warn',
      'max-lines-per-function': ['warn', { max: 50, skipComments: true }],
      'jsdoc/require-jsdoc': ['error', { require: { FunctionDeclaration: true, MethodDefinition: true, ArrowFunctionExpression: true, FunctionExpression: true } }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { parser: require('@typescript-eslint/parser') },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'after-used', vars: 'all' }],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
    },
  },
  {
    ignores: ['**/.next/**', '**/.dist/**', '**/wwwroot/lib/**', 'eslint.config.js', 'eslint-plugin-custom-rules/rules/no-redux.js'],
  }
];