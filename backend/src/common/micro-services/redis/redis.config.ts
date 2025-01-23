import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TEnvironmentFile } from 'src/common/config/my-config-service.type';
import KeyvRedis from '@keyv/redis';

export const redisCacheConfig: CacheModuleAsyncOptions | any = {
    isGlobal: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService<TEnvironmentFile>) => {
        const host = configService.getOrThrow('REDIS_HOST');
        const port = configService.getOrThrow('REDIS_PORT');

        return {
            store: () => new KeyvRedis(`redis://${host}:${port}`),
        };
    },
};
