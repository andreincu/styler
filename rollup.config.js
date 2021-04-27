import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import scss from 'rollup-plugin-scss';
import svg from 'rollup-plugin-svg';
import resolve from '@rollup/plugin-node-resolve';
import htmlBundle from 'rollup-plugin-html-bundle';

export default [
  {
    input: 'src/code/main.ts',
    output: {
      file: 'public/code.js',
      name: 'code',
      format: 'cjs',
    },
    plugins: [resolve(), typescript(), commonjs()],
  },
  {
    input: 'src/ui/main.js',
    output: {
      file: 'src/ui/build/bundle.js',
      name: 'ui',
      format: 'iife',
    },
    plugins: [
      svelte({
        include: 'src/**/*.svelte',
        // Optionally, preprocess components with svelte.preprocess:
        // https://svelte.dev/docs#svelte_preprocess
        preprocess: sveltePreprocess({
          defaults: {
            script: 'typescript',
            style: 'scss',
          },
        }),
      }),

      typescript(),
      scss(),
      svg(),
      htmlBundle({
        template: 'src/ui/template.html',
        target: 'public/ui.html',
        inline: true,
      }),

      resolve({
        browser: true,
      }),
    ],
  },
];
