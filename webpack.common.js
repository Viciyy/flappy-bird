const path = require('path');

module.exports = {
  entry: './src/app.js',
  resolve: {
    extensions: [ '.js' ]
  },
  output: {
    filename: 'app.js',
    path: path.resolve(__dirname, 'dist')
  },
};