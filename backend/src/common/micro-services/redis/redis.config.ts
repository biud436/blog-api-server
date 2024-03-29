import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { TEnvironmentFile } from 'src/common/config/my-config-service.type';

export const redisCacheConfig: CacheModuleAsyncOptions | any = {
    isGlobal: true,
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: async (configService: ConfigService<TEnvironmentFile>) => {
        const store = await redisStore({
            socket: {
                host: configService.getOrThrow('REDIS_HOST'),
                port: +configService.getOrThrow('REDIS_PORT'),
            },
        });

        return {
            store: () => store,
        };
    },
};
