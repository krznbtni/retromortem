module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	env: {
		browser: true,
		es2017: true,
		node: true,
	},
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		extraFileExtensions: ['.svelte'],
		sourceType: 'module',
		ecmaVersion: 2020,
	},
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:svelte/recommended',
		'plugin:svelte/prettier',
		'plugin:prettier/recommended',
	],
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				sourceType: 'module',
				ecmaVersion: 2020,
				parser: '@typescript-eslint/parser',
			},
		},
		{
			files: ['src/**/*.test.ts'],
			extends: ['plugin:vitest/recommended'],
		}
	],
	rules: {
		// JavaScript
		'arrow-body-style': ['error'],
		'no-unneeded-ternary': ['error', {defaultAssignment: false}],
		'no-unused-expressions': ['error'],
		'prefer-arrow-callback': ['error'],

		// TypeScript
		'@typescript-eslint/consistent-type-imports': ['error'],
		'@typescript-eslint/no-inferrable-types': ['error'],
		'@typescript-eslint/no-unused-vars': [
			'warn',
			{argsIgnorePattern: '^_', varsIgnorePattern: '^_'},
		],
	},
	ignorePatterns: ['*.cjs', 'svelte.config.js', 'node_modules', 'build'],
};
