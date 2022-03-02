// @ts-check

const Dotenv = require("dotenv-webpack");
const withTM = require("next-transpile-modules");
/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
  async rewrite() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_SERVER_IP}/:path*`, // Proxy to Backend
      },
    ];
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.plugins.push(new Dotenv({ silent: true }));
    return config;
  },
  publicRuntimeConfig: {
    backendUrl: process.env.NEXT_PUBLIC_SERVER_IP,
  },
};

module.exports = nextConfig;
