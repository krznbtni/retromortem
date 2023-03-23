import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		alias: {
			$lib: path.resolve(__dirname, 'src/lib'),
		},
		
		output: {
			preloadStrategy: 'preload-mjs',
		},

		typescript: {
			config: conf => {
				return {
					...conf,
					compilerOptions: {
						...conf.compilerOptions,
						baseUrl: '.',
						preserveConstEnums: true /* Disable erasing 'const enum' declarations in generated code. */,
						strict: true /* Enable all strict type-checking options. */,
						noImplicitAny: true /* Enable error reporting for expressions and declarations with an implied 'any' type. */,
						strictNullChecks: true /* When type checking, take into account 'null' and 'undefined'. */,
						noImplicitThis: true /* Enable error reporting when 'this' is given the type 'any'. */,
						useUnknownInCatchVariables: true /* Default catch clause variables as 'unknown' instead of 'any'. */,
						noUnusedLocals: true /* Enable error reporting when local variables aren't read. */,
						noUnusedParameters: true /* Raise an error when a function parameter isn't read. */,
						exactOptionalPropertyTypes: true /* Interpret optional property types as written, rather than adding 'undefined'. */,
						noImplicitReturns: true /* Enable error reporting for codepaths that do not explicitly return in a function. */,
						noFallthroughCasesInSwitch: true /* Enable error reporting for fallthrough cases in switch statements. */,
						noUncheckedIndexedAccess: true /* Add 'undefined' to a type when accessed using an index. */,
						noImplicitOverride: true /* Ensure overriding members in derived classes are marked with an override modifier. */,
						noPropertyAccessFromIndexSignature: true,       /* Enforces using indexed accessors for keys declared using an indexed type. */
						allowUnusedLabels: false,                        /* Disable error reporting for unused labels. */
						allowUnreachableCode: false /* Disable error reporting for unreachable code. */,
					},
				};
			},
		},
	}
};

export default config;
    