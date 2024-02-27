const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  module: {
    rules: [
      {
      exclude: /node_modules/
      }
    ]
  },
  mode: 'development',
});