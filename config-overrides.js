module.exports = function override(config, env) {
    if (env !== "production") {
        return config;
    }

    config.output.filename = "dl.js";
    config.output.chunkFilename = "js/[name].chunk.[hash:8].js";

    const miniCssExtractPlugin = config.plugins.find(element => element.constructor.name === "MiniCssExtractPlugin");
    miniCssExtractPlugin.options.filename = "dl.css";
    miniCssExtractPlugin.options.chunkFilename = "css/[name].[hash:8].css";

    return config;
};