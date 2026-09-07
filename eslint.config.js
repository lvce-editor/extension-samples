import * as config from '@lvce-editor/eslint-config'
import { defineConfig } from 'eslint/config'
import sampleConfig from './eslint.samples.config.js'

export default defineConfig([
  {
    ignores: ['.tmp/**', 'dist/**'],
  },
  ...config.default,
  ...config.recommendedTsconfig,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-import-type-side-effects': 'error',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
  {
    files: ['packages/sample-*/**/*.ts'],
    extends: sampleConfig,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['packages/e2e/**/*.ts'],
    rules: {
      'e2e/no-imports': 'off',
      'e2e/no-direct-click': 'off',
    },
  },
  {
    rules: {
      'github-actions/permissions': 'off',
    },
  },
])
