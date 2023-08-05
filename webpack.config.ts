import "webpack-dev-server"

import path from "path"
import type { Configuration } from "webpack"

const config: Configuration = {
  mode: "development",
  resolve: {
    fallback: {
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
    },
    extensions: [".ts", ".js"],
  },
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  devtool: "inline-source-map",
  devServer: {
    client: {
      logging: "warn",
    },
    static: {
      directory: path.resolve(__dirname, "dist"),
    },
  },
}

export default config
