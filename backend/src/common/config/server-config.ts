import { EventEmitter } from 'stream';
import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

interface IServerConfig {
    server: {
        whitelist: string[];
        host: {
            local: string;
            production: string[];
        };
        port: number;
    };
    redis: {
        host: string;
        port: number;
    };
}

export class ServerConfig implements IServerConfig {
    server: {
        whitelist: string[];
        host: {
            local: string;
            production: string[];
        };
        port: number;
    };
    redis: {
        host: string;
        port: number;
    };

    constructor({ server, redis }: IServerConfig) {
        this.server = server;
        this.redis = redis;
    }
}

/**
 * @class ServerConfigFactory
 */
export class ServerConfigFactory {
    public static EVENT = new EventEmitter();

    private readTargetFile(): string {
        const target =
            process.env.NODE_ENV?.toLocaleLowerCase() || 'development';

        switch (target) {
            default:
            case 'development':
                return '.config-local.yaml';
            case 'production':
                return '.config.yaml';
        }
    }

    // async ready() {
    //     try {
    //         const content = await fs.promises.readFile(
    //             path.join(__dirname, '..', '..', '..', this.readTargetFile()),
    //             'utf-8',
    //         );
    //         const config = YAML.parse(content);

    //         const serverConfig = new ServerConfig(config);

    //         ServerConfigFactory.EVENT.emit('load', serverConfig);

    //         return serverConfig;
    //     } catch (e: any) {
    //         throw new Error(
    //             `설정 파일을 읽는 도중 오류가 발생했습니다. ${e.message}`,
    //         );
    //     }
    // }
}
