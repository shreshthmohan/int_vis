module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    d3: 'readonly',

    _: 'readonly',
  },

  // parserOptions: {
  //   ecmaVersion: 2017,
  // },

  parserOptions: {
    parser: 'babel-eslint',
  },
  extends: ['@clark/eslint-config-browser'],
  // add your custom rules here
  rules: {
    'no-unused-vars': 'error',
    'quotes': ['error', 'single'],
    // 'comma-dangle': ['error', 'always-multiline'],
    'no-console': ['warn', { allow: ['error'] }],
    'camelcase': 'off',
    'space-before-function-paren': 'off',
    'no-unused-expressions': 'off',
    'unicorn/filename-case': 'off',
    'unicorn/no-array-for-each': 'off',
    'unicorn/prefer-ternary': 'off',
    'prettier/prettier': 'off',
    'no-use-before-define': 'off',
  },
}
