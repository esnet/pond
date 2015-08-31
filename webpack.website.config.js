//
// webpack.website.config.js to build an the pond website bundle.
//

module.exports = {

  entry: {
    app: ['./website/modules/main.jsx']
  },

  output: {
    filename: 'website-bundle.js'
  },

  module: {
    loaders: [
      { test: /\.(js|jsx)$/, loader: 'babel?optional=es7.objectRestSpread' },
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg|gif)$/, loader: 'url-loader?limit=20000'},
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader?name=[name].[ext]" }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json']
  }
};