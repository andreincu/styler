import path from 'path';
import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-bundle-html-plus';
import svg from 'rollup-plugin-svg';
import scss from 'rollup-plugin-scss';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import { terser } from 'rollup-plugin-terser';

const projectRootDir = path.resolve(__dirname);
const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'src/code/main.ts',
    output: {
      file: 'bundle/code.js',
      name: 'code',
      format: 'iife',
    },
    plugins: [
      customAlias(),
      resolve(),
      typescript(),
      production && terser({ format: { comments: false } }),
    ],
  },
  {
    input: 'src/ui/main.js',
    output: {
      file: 'bundle/ui/ui.js',
      name: 'ui',
      format: 'iife',
    },
    plugins: [
      customAlias(),
      resolve(),

      svg(),
      typescript(),
      production && terser({ format: { comments: false } }),

      svelte({
        include: 'src/**/*.svelte',
        preprocess: sveltePreprocess(),
      }),

      scss({
        output: 'bundle/ui/styles.css',
      }),

      html({
        template: 'src/ui/template.html',
        dest: 'bundle/ui/',
        filename: 'ui.html',
        inline: true,
        minifyCss: true && production,
      }),
    ],
  },
];

function customAlias() {
  return alias({
    entries: [
      { find: '@code', replacement: path.resolve(projectRootDir, './src/code/') },
      { find: '@modules', replacement: path.resolve(projectRootDir, './src/code/modules') },
      { find: '@components', replacement: path.resolve(projectRootDir, './src/ui/components') },
      { find: '@assets', replacement: path.resolve(projectRootDir, './src/assets') },
      { find: '@styles', replacement: path.resolve(projectRootDir, './src/ui/styles') },
    ],
  });
}
