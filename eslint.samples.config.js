import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export const sampleConfig = [
  ...tseslint.configs.strictTypeChecked,
  unicorn.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // The sample entry points intentionally start main without awaiting it.
      '@typescript-eslint/no-floating-promises': ['error', { allowForKnownSafeCalls: ['main'] }],
      'no-debugger': 'error',
      // Keep extension API names (uri, cwd, etc.) and explicit undefined values.
      'unicorn/name-replacements': 'off',
      'unicorn/no-useless-undefined': 'off',
      // Start samples without top-level await.
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
]
