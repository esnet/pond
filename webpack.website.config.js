//
// webpack.website.config.js to build an the pond website bundle.
//

var AnyBarWebpackPlugin = require('anybar-webpack');

module.exports = {

    entry: {
        app: ["./website/modules/main.jsx"]
    },

    output: {
        filename: "website-bundle.js"
    },

    module: {
        loaders: [
            {
                test: /\.(jsx|js)$/,
                loader: "babel",
                exclude: /node_modules/
            },
            { test: /\.css$/, loader: "style-loader!css-loader" },
            { test: /\.(png|jpg|gif)$/, loader: "url-loader?limit=20000"},
            { test: /\.json$/, loader: "json-loader" }
        ]
    },

    externals: [
        {
            window: "window"
        }
    ],

    node: {
        Buffer: true,
        fs: "empty"
    },

    resolve: {
        extensions: ["", ".js", ".jsx", ".json"]
    },

    plugins: [
        new AnyBarWebpackPlugin({
            enableNotifications: true
        })
    ]
};
