//
// webpack.website.config.js to build an the pond website bundle.
//

module.exports = {

    entry: {
        app: ["./website/modules/main.jsx"]
    },

    output: {
        filename: "website-bundle.js"
    },

    module: {
        loaders: [
            { test: /\.(js|jsx)$/, loader: "babel?stage=0" },
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

    resolve: {
        extensions: ["", ".js", ".jsx", ".json"]
    }
};
