// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended', // Intègre Prettier dans ESLint
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        '@typescript-eslint/no-explicit-any': 'warn', // Avertit si `any` est utilisé
        '@typescript-eslint/no-unused-vars': 'error', // Variables inutilisées = erreur
        '@typescript-eslint/explicit-function-return-type': 'off', // Optionnel : désactive si tu préfères l'inférence
    },
};
