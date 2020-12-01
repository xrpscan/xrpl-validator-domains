const COMPLEXITY = 15

module.exports = {
  root: true,

  // Make ESLint compatible with TypeScript
  parser: '@typescript-eslint/parser',
  parserOptions: {
    // Enable linting rules with type information from our tsconfig
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.eslint.json'],

    // Allow the use of imports / ES modules
    sourceType: 'module',

    ecmaFeatures: {
      // Enable global strict mode
      impliedStrict: true,
    },
  },

  ignorePatterns: [
    // Ignoring node_modules since generated code doesn't conform to our linting standards
    'node_modules',
    // Ignore build since generated code doesn't conform to our linting standards
    'build',
    // Eslint doesn't lint typing files well so we will just ignore them
    '*.d.ts',
    // Database-config is a common-js file that is required by sequelize cli and doesn't conform to our more cultured ways
    'database-config.js',
  ],

  // Specify global variables that are predefined
  env: {
    // Enable node global variables & Node.js scoping
    node: true,
    // Add all ECMAScript 2020 globals and automatically set the ecmaVersion parser option to ES2020
    es2020: true,
  },

  plugins: ['mocha', 'disable'],
  processor: 'disable/disable',
  extends: ['@xpring-eng/eslint-config-base/loose', 'plugin:mocha/recommended'],
  rules: {
    // Removes comments and blank lines from the max-line rules
    'max-lines-per-function': [
      'warn',
      {
        max: 75,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-lines': [
      'warn',
      {
        max: 250,
        skipBlankLines: true,
        skipComments: true,
      },
    ],

    // Multiple manifest formats means naming conventions vary
    '@typescript-eslint/naming-convention': 'off',

    // Up complexity for type guards, which check many conditions
    complexity: ['error', COMPLEXITY],
  },
  overrides: [
    {
      files: ['test/**/*.ts'],
      rules: {
        // Removed the max for test files and test helper files, since tests usually need to import more things
        'import/max-dependencies': 'off',

        // describe blocks count as a function in Mocha tests, and can be insanely long
        'max-lines-per-function': 'off',

        // Tests can be very long turns off max-line count
        'max-lines': 'off',

        // We have lots of statements in tests
        'max-statements': 'off',
      },
    },
    {
      files: ['test/**/*.test.ts'],
      env: {
        // Global variables for mocha
        mocha: true,
      },
      rules: {
        // For our test files, the pattern has been to have unnamed functions
        'func-names': 'off',

        // Allow magic numbers for testing
        '@typescript-eslint/no-magic-numbers': 'off',
      },
      settings: {
        'disable/plugins': ['mocha'],
      },
    },
    {
      files: ['src/migrations/*.js'],
      rules: {
        // Removed no-commonjs requirement as migrations must be in common js format for the sequelize cli
        'import/no-commonjs': 'off',

        // Removed this as the format required by the migrations prevents us from doing this differently
        'import/unambiguous': 'off',

        // Removed as these are not typescript files and you can't define a return type
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
    {
      files: ['.eslintrc.js', 'mocha.config.js'],
      rules: {
        // Removed no-commonjs requirement as eslint must be in common js format
        'import/no-commonjs': 'off',

        // Removed this as eslint prevents us from doing this differently
        'import/unambiguous': 'off',
      },
    },
  ],
}
