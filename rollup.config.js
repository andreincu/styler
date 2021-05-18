import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import html from 'rollup-plugin-bundle-html-thomzz';
import scss from 'rollup-plugin-scss';
import svelte from 'rollup-plugin-svelte';
import svg from 'rollup-plugin-svg';
import sveltePreprocess from 'svelte-preprocess';
import { terser } from 'rollup-plugin-terser';

const projectRootDir = path.resolve(__dirname);
const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/code/code.ts',
    output: {
      file: 'public/bundle/code.js',
      name: 'code',
      format: 'iife',
    },
    plugins: [resolve(), typescript(), production && terser({ format: { comments: false } })],
  },
  {
    input: 'src/ui/ui.js',
    output: {
      file: 'public/bundle/temp/ui.js',
      name: 'ui',
      format: 'iife',
    },
    plugins: [
      alias({
        entries: [
          { find: '@modules', replacement: path.resolve(projectRootDir, './src/code/modules') },
          { find: '@components', replacement: path.resolve(projectRootDir, './src/ui/components') },
          { find: '@assets', replacement: path.resolve(projectRootDir, './src/assets') },
          { find: '@styles', replacement: path.resolve(projectRootDir, './src/ui/styles') },
        ],
      }),

      resolve(),

      svg(),
      typescript(),
      production && terser({ format: { comments: false } }),

      svelte({
        include: 'src/**/*.svelte',
        preprocess: sveltePreprocess(),

        // getting rid of css unused warnings
        onwarn: (warning, handler) => {
          if (warning.code === 'css-unused-selector') return;

          handler(warning);
        },
      }),

      scss({
        output: 'public/bundle/temp/styles.css',
      }),

      html({
        template: 'src/ui/template.html',
        dest: 'public/bundle',
        filename: 'ui.html',
        inline: true,
        minifyCss: true,
      }),
    ],
  },
];
