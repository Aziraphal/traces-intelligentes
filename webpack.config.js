const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    'background/secure-background': './src/background/secure-background.js',
    'popup/popup': './src/popup/popup.js'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { 
          from: "src/manifest.json",
          to: "manifest.json"
        },
        { 
          from: "src/popup/popup.html",
          to: "popup/popup.html"
        },
        {
          from: "src/popup/popup.css",
          to: "popup/popup.css"
        },
        {
          from: "src/icons",
          to: "icons/"
        },
        // Ajoutez également le fichier CSS du contenu si vous en avez besoin
        {
          from: "src/content/content.css",
          to: "content/content.css",
          noErrorOnMissing: true
        }
      ],
    }),
  ],
  resolve: {
    extensions: ['.js']
  },
  devtool: 'source-map'
};