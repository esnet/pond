// webpack.test.config.js
var path = require("path");

module.exports = {
    entry: {
        "bucket_test":   "mocha!./test/index"
    },
    output: {
        "path":          "./devserver/tests/",
        "filename":      "tests.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    resolve: {
        extensions: ["", ".js"],
        modulesDirectories: ["node_modules", "."]
    },
};
