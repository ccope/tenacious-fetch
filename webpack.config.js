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
  }
}

module.exports = [ serverConfig, clientConfig ];
