import unicorn from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

export default [
  ...tseslint.configs.strictTypeChecked,
  unicorn.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-debugger': 'error',
      // Keep extension API names (uri, cwd, etc.) and explicit undefined values.
      'unicorn/name-replacements': 'off',
      'unicorn/no-useless-undefined': 'off',
      // Start samples with main().catch(console.error) without top-level await.
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-top-level-await': 'off',
    },
  },
]
