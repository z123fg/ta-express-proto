var path = require("path");
module.exports = {
    mode: "development",
    entry: {
        main: "./src/app.ts",
        "data-source": {
            import: "./src/db/db-resource.ts",
            library: {
                type: "commonjs2",
            },
        },
        typeorm: "./node_modules/typeorm/cli.js",
    },
    target: "node",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
};
