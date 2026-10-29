import js from '@eslint/js';

export default [
  {
    ignores: ['dist/**', 'node_modules/**', '.aistudio/**', 'build/**'],
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      'no-debugger': 'error',
      'no-unused-vars': 'warn',
      'prefer-const': 'error',
    },
  },
];
