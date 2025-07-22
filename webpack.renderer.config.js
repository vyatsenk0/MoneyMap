const rules = require('./webpack.rules');
const path = require("path");

// Add rule for SVG files
rules.push({
  test: /\.svg$/,
  use: ['file-loader'],  // This will handle SVG files and copy them to your build folder
});

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,  // Apply all the rules
  },
  resolve: {
    extensions: ['.js', '.jsx', '.css', '.svg'],  // Ensure SVG files are resolved
  },
  devServer: {  // Applies a CSP specifically for Webpack Dev Server in development mode
    hot: true,  // enables Hot Module Replacement (HMR), which allows Webpack to update modules in the browser without requiring a full page reload
    headers: {  
    // default-src:  restricts all sources by default, meaning no content can be loaded unless specified explicitly.
    // connect-src 'self' This allows connections to self (the same origin as the page) and WebSocket connections (ws://localhost:3000).
      'Content-Security-Policy': "default-src 'none'; connect-src 'self' ws://localhost:3000;",  
    },
  },
};
