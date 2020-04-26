import babel from 'rollup-plugin-babel'
import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'
import resolve from '@rollup/plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'

const isProd = process.env.NODE_ENV === 'production'

export default {
  input: 'src/index.ts',

  output: [
    {
      file: 'lib/touchable.esm.js',
      format: 'es',
    },
    {
      file: 'lib/touchable.umd.js',
      name: 'touchable',
      format: 'umd',
    },
  ],

  treeshake: {
    propertyReadSideEffects: false,
  },

  external: ['react', 'react-dom'],

  plugins: [
    resolve({
      extensions: ['ts', 'tsx'],
    }),
    json(),
    babel({
      exclude: 'node_modules/**',
    }),
    typescript(),
    replace(),
    isProd && terser()
  ],
}