// @ts-check

const Dotenv = require("dotenv-webpack");
const withTM = require("next-transpile-modules");

function getServerUrl() {
    return process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_SERVER_IP
        : "http://localhost:3000";
}

/**
 * @type {import('next').NextConfig}
 **/
const nextConfig = {
    async rewrite() {
        return [
            {
                source: "/api/:path*",
                destination: `${getServerUrl()}/:path*`, // Proxy to Backend
            },
        ];
    },
    reactStrictMode: true,
    webpack: (config) => {
        config.plugins.push(new Dotenv({ silent: true }));
        return config;
    },
    publicRuntimeConfig: {
        backendUrl: getServerUrl(),
    },
};

module.exports = nextConfig;
