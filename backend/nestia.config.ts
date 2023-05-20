import { INestiaConfig } from '@nestia/sdk';

const config: INestiaConfig = {
    input: {
        include: [
            '**/admin.controller.ts',
            '**/api.controller.ts',
            '**/posts.controller.ts',
            '**/image.controller.ts',
            '**/auth.controller.ts',
            '**/health-check.controller.ts',
            '**/rss.controller.ts',
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
            {
                url: 'https://blog-api.biud436.com',
                description: 'Production Server',
            },
        ],
    },
    compilerOptions: {
        skipLibCheck: true,
        types: ['node', 'jest', 'global.d.ts'],
    },
};

export default config;
