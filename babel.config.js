module.exports = () => {
  const presets = [
    ['env', {
      modules: false
    }],
    'react',
    'typescript'
  ]

  const plugins = [
    'transform-runtime'
  ]

  return {
    presets,
    plugins
  }
}