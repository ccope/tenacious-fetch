const path = require('path');

const serverConfig = {
  target: 'node',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  entry: './src/index.js',
  output: {
    filename: 'main.node.js',
    library: 'tenaciousFetch',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  }
}

const clientConfig = {
  target: 'web',
  module: {
    rules: [
      { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
    ]
  },
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    library: 'tenaciousFetch',
    libraryTarget: 'umd',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
      alias: {
        perf_hooks: path.resolve(__dirname, 'src/_empty.js')
      }
  }
}

module.exports = [ serverConfig, clientConfig ];
