import {fileURLToPath} from 'node:url';
import path from 'node:path';

import {defineConfig} from 'vitest/config';
import {sveltekit} from '@sveltejs/kit/vite';
import Icons from 'unplugin-icons/vite';

import barrel from '@krznbtni/rollup-plugin-svelte-component-barrel-file';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    barrel({
      pathToComponentsDir: path.resolve(__dirname, 'src/lib/components'),
      pathAliasToComponentsDir: '$lib/components',
    }),
    sveltekit(),
    Icons({
      compiler: 'svelte',
    }),
  ],
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
