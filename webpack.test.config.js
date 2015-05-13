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
          { test: /\.(js|jsx)$/, loader: 'babel?optional=es7.objectRestSpread', exclude: /node_modules/ },
          { test: /\.json$/, loader: "json-loader" },
        ]
    },
    resolve: {
        extensions: ["", ".js"],
        modulesDirectories: ["node_modules", "."]
    },
};
