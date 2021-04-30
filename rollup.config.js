import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import svg from 'rollup-plugin-svg';
import scss from 'rollup-plugin-scss';
import typescript from '@rollup/plugin-typescript';
import html from 'rollup-plugin-bundle-html-thomzz';
import alias from '@rollup/plugin-alias';

// optional - delete the bundle directory before bundling
import del from 'rollup-plugin-delete';
import path from 'path';

const projectRootDir = path.resolve(__dirname);

export default [
  {
    input: 'src/ui/main.js',
    output: {
      file: 'public/bundle/ui.js',
      name: 'ui',
      format: 'iife',
    },
    external: ['prettier', 'svelte'],
    plugins: [
      alias({
        entries: [
          { find: '@modules', replacement: path.resolve(projectRootDir, 'src/code/modules') },
          { find: '@components', replacement: path.resolve(projectRootDir, 'src/ui/components') },
          { find: '@assets', replacement: path.resolve(projectRootDir, 'src/assets') },
          { find: '@styles', replacement: path.resolve(projectRootDir, 'src/ui/styles') },
        ],
      }),

      nodeResolve(),
      commonjs(),

      svg(),
      typescript(),

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
        output: 'public/bundle/styles.css',
      }),

      html({
        template: 'src/ui/template.html',
        dest: 'public/bundle',
        filename: 'ui.html',
        inline: true,
        minifyCss: true,
      }),

      del({ targets: 'public/bundle/*' }),
    ],
  },
  {
    input: 'src/code/main.ts',
    output: {
      file: 'public/bundle/code.js',
      name: 'code',
      format: 'iife',
    },
    plugins: [nodeResolve(), typescript()],
  },
];
