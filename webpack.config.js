const path = require('path')

const webpack = require('webpack')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

function getDefaultConfiguration() {
  return {
    cache: true,
    performance: { hints: false },
    stats: 'errors-only',
    entry: './dist/index.js',
    output: {
      library: 'verifyDomain',
      path: path.join(__dirname, 'build/'),
      filename: `xrpl-validator-domains.default.js`,
    },
    module: {
      rules: [],
    },
    resolve: {
      extensions: ['.js', '.json'],
      fallback: {
        buffer: require.resolve('buffer'),
        assert: require.resolve('assert'),
        stream: require.resolve('stream-browserify')
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
  }
}

module.exports = [
  function (env, argv) {
    const config = getDefaultConfiguration()
    config.mode = 'development'
    config.output.filename = `xrpl-validator-domains.js`
    return config
  },
  function (env, argv) {
    const config = getDefaultConfiguration()
    config.mode = 'production'
    config.output.filename = `xrpl-validator-domains-min.js`
    if (process.argv.includes('--analyze')) {
      config.plugins.push(new BundleAnalyzerPlugin())
    }
    return config
  },
]
