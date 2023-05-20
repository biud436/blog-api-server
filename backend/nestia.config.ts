import { INestiaConfig } from '@nestia/sdk';

const config: INestiaConfig = {
    input: {
        include: [
            '**/posts.controller.ts',
            '**/image.controller.ts',
            '**/auth.controller.ts',
        ],
        // exclude: ['apps/page-service/**/*', 'apps/user-service/**/*'],
    },
    swagger: {
        output: './public/swagger.json',
        security: {
            bearerAuth: {
                type: 'apiKey',
                in: 'header',
                name: 'Authorization',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Server',
            },
        ],
    },
    compilerOptions: {
        skipLibCheck: true,
        types: ['node', 'jest', 'global.d.ts'],
    },
};

export default config;
