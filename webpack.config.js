// 配置参数
var sourceMap = false; //是否使用sourceMap

var libraryName = require('./package.json').name; 
var path = require('path');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

var config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: libraryName + '.js',
    library: libraryName,
    libraryTarget: 'umd'
  },
  devtool: sourceMap ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};

if (process.env.NODE_ENV === 'uglify') {
  config.output.filename = libraryName + '.min.js';
  config.plugins = (config.plugins || []).concat([
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: false,
        mangle: true,
        output: {
          comments: true,
          beautify: false
        }
      },
      sourceMap: true
    })
  ]);
}

module.exports = config;
