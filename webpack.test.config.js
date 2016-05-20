// webpack.test.config.js
var path = require("path");

module.exports = {
    entry: {
        test: "mocha!./test/index"
    },
    output: {
        path: "./devserver/tests/",
        filename: "tests.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: "babel",
                exclude: /node_modules/
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            }
        ]
    },
    node: {
        fs: "empty"
    },
    resolve: {
        extensions: ["", ".js"],
        modulesDirectories: ["node_modules", "."]
    }
};
