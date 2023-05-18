import { INestiaConfig } from '@nestia/sdk';

const config: INestiaConfig = {
    input: 'src/controllers',
    swagger: {
        output: 'dist/swagger.json',
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Server',
            },
        ],
    },
};

export default config;
