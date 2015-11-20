/* eslint "no-var": 0 */

var webpack = require("webpack");

var plugins = [
    new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
];

if (process.env.COMPRESS) {
    plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    );
}

module.exports = {

    output: {
        library: ["ESnet", "Pond"],
        libraryTarget: "assign"
    },

    module: {
        loaders: [
            { test: /\.(js|jsx)$/,
              loader: "babel?optional=es7.objectRestSpread" }
        ]
    },

    node: {
        Buffer: false
    },

    plugins: plugins
};
