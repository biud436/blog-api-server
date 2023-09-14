const path = require('path');
const nodeExternals = require('webpack-node-externals');

const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
    '@nestjs/platform-express',
    'swagger-ui-express',
    'class-transformer/storage',
    '@mapbox/node-pre-gyp',
];

module.exports = (options, webpack) => ({
    ...options,
    externals: [
        nodeExternals({
            modulesFromFile: true,
        }),
    ],
    plugins: [
        ...options.plugins,
        new webpack.IgnorePlugin({
            checkResource(resource) {
                if (lazyImports.includes(resource)) {
                    try {
                        require.resolve(resource);
                    } catch (err) {
                        return true;
                    }
                }
                return false;
            },
        }),
    ],
});
