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
        library: ["Pond"],
        libraryTarget: "assign"
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel",
                exclude: /node_modules/
            }
        ]
    },

    node: {
        Buffer: false
    },

    plugins: plugins,

    resolve: {
        extensions: [".js", ".jsx", ".json"]
    }
};
