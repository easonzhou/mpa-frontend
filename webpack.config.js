var debug = process.env.NODE_ENV !== "production";
var webpack = require('webpack');
var path = require('path');

module.exports = {
  context: path.join(__dirname, "public"),
  devtool: debug ? "inline-sourcemap" : null,
  entry: {
      client: "./javascript/client.js",
      main: "./javascript/main.js",
      login: "./javascript/login.js",
      highUtil: "./javascript/highUtil.js",
      eta: "./javascript/eta.js",
      interceptor: "./javascript/interceptor.js",
  },
  output: {
    path: __dirname + "/public/build/js",
    filename: "[name].min.js"
  },
  plugins: debug ? [] : [
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
  ],
};

