module.exports = {
  mode: "development",
  resolve: {
    fallback: {
      https: require.resolve("https-browserify"),
      http: require.resolve("stream-http"),
    },
  },
  entry: "./index.js",
  output: {
    filename: "dist.js",
    path: __dirname,
  },
  devServer: {
    client: {
      logging: "warn",
    },
    static: {
      directory: __dirname,
    },
  },
};
