module.exports = {
  reactStrictMode: true,
  transpilePackages: ["ui", "utils"],
  swcMinify: true,
  output: "standalone",
  compiler: {
    styledComponents: true,
  },
};
