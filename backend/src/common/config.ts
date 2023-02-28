import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { TEnvironmentFile } from './my-config-service.type';

/**
 * @interface DBConnectionType
 * @description DB 타입을 정의합니다.
 */
interface DBConnectionType {
    /**
     * 개발 DB 입니다.
     */
    dev: TypeOrmModuleOptions;
    /**
     * 실제 DB 입니다.
     */
    production: TypeOrmModuleOptions;
}

type ParitialDBType = Partial<TypeOrmModuleOptions>;

export default (
    configService: ConfigService<TEnvironmentFile>,
): DBConnectionType => {
    // 기본 옵션
    const defaultOption = <ParitialDBType>{
        type: 'mariadb',
        host: configService.getOrThrow('DB_HOST'),
        port: +configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USER'),
        password: configService.getOrThrow('DB_PASSWORD'),
        database: configService.getOrThrow('DB_NAME'),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        dateStrings: true,
        bigNumberStrings: false,
        timezone: 'Asia/Seoul',
    };

    return {
        dev: {
            ...defaultOption,
            synchronize: true,
            // logging: true,
        },
        production: {
            type: 'mysql',
            host: configService.getOrThrow('DB_HOST'),
            port: +configService.getOrThrow('DB_PORT'),
            username: configService.getOrThrow('DB_USER'),
            password: configService.getOrThrow('DB_PASSWORD'),
            database: configService.getOrThrow('DB_NAME'),
            autoLoadEntities: true,

            namingStrategy: new SnakeNamingStrategy(),
            dateStrings: true,
            bigNumberStrings: false,
            timezone: 'Asia/Seoul',
            synchronize: true,
            logging: ['error', 'warn'],
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
        },
    };
};
