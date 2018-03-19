import babel from 'rollup-plugin-babel'
import builtins from 'rollup-plugin-node-builtins'
import pkg from './package.json'

const name = 'transitionableRoute'

const output = {
  umd: pkg.main,
  es: pkg.module
}

export default {
  input: 'src/index.js',
  output: [
    {
      file: output.umd,
      format: 'umd',
      name
    },
    {
      file: output.es,
      format: 'es'
    }
  ],
  external: [...Object.keys(pkg.dependencies || {})],
  plugins: [
    babel({
      exclude: 'node_modules/**'
      // plugins: ['external-helpers']
    }),
    builtins()
  ]
}
