module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended', // Must be last to override other configs
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-refresh', '@typescript-eslint', 'react', 'jsx-a11y', 'import'],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    // React Refresh
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],

    // React rules
    'react/prop-types': 'off', // Using TypeScript for prop validation
    'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
    'react/jsx-uses-react': 'off', // Not needed with new JSX transform
    'react/jsx-no-target-blank': ['error', { allowReferrer: true }],
    'react/self-closing-comp': 'warn',
    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

    // TypeScript rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      },
    ],

    // Import rules
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling'],
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        pathGroups: [
          {
            pattern: 'react',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '{api,components,pages,hooks,providers,interfaces,assets}/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['react'],
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'warn',
    'import/no-unused-modules': 'off', // Can be slow in large projects
    'import/namespace': 'off', // Can be slow with TypeScript

    // Accessibility rules
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        components: ['Link'],
        specialLink: ['to'],
      },
    ],

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-var': 'error',
    'object-shorthand': 'warn',
    'prefer-template': 'warn',
  },
};
