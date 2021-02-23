module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    indent: 'off',
    'linebreak-style': 0,
    quotes: 'off',
    semi: ['error', 'always'],
    'no-console': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'no-mixed-operators': 'off',
    strict: 0,
    'function-paren-newline': 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'ignore',
      },
    ],
    'no-unexpected-multiline': ['off'],
    'no-spaced-func': ['off'],
    'import/prefer-default-export': ['off'],
    'no-underscore-dangle': 'off',
    // We disable max length, makes no sense when using prettier
    'max-len': 'off',
    'import-helpers/order-imports': [
      'warn',
      {
        newlinesBetween: 'always', // new line between groups
        groups: ['module', ['parent', 'sibling', 'index']],
        alphabetize: { order: 'asc', ignoreCase: true },
      },
    ],
    '@typescript-eslint/no-explicit-any': 0,
  },
  plugins: ['eslint-plugin-import-helpers'],
};
