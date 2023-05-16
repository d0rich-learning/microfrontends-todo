const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const WebpackRemoteTypesPlugin = require("webpack-remote-types-plugin").default

const moduleFederationRemotes = {
  counter: "entities@http://localhost:8081/remoteEntry.js",
}

const deps = require("./package.json").dependencies;
module.exports = (_, argv) => ({
  output: {
    publicPath: "http://localhost:8080/",
  },

  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  devServer: {
    port: 8080,
    historyApiFallback: true,
  },

  module: {
    rules: [
      {
        test: /\.m?js/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.(css|s[ac]ss)$/i,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },

  plugins: [ // This is important part
    new ModuleFederationPlugin({
      name: "main",
      filename: "remoteEntry.js",
      remotes: moduleFederationRemotes,
      exposes: {},
      shared: {
        ...deps,
        react: {
          singleton: true,
          requiredVersion: deps.react,
        },
        "react-dom": {
          singleton: true,
          requiredVersion: deps["react-dom"],
        },
      },
    }),
    new WebpackRemoteTypesPlugin({
      remotes: moduleFederationRemotes,
      outputDir: 'types', // supports [name] as the remote name
      remoteFileName: '[name]-dts.tgz'
    }),
    new HtmlWebPackPlugin({
      template: "./src/index.html",
    }),
  ],
});
