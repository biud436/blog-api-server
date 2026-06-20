import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from '@stingerloom/orm';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import type { DatabaseClientOptions } from '@stingerloom/orm';
import { STINGERLOOM_DOMAIN_ENTITIES } from '../../../domain';
import { TEnvironmentFile } from '../../config/my-config-service.type';

@Module({
  imports: [
    StingerloomOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (
        configService: ConfigService<TEnvironmentFile>,
      ): DatabaseClientOptions => {
        const isProduction =
          !StingerloomDatabaseModule.isDevelopment();

        return {
          type: isProduction ? 'mysql' : 'mariadb',
          host: configService.getOrThrow('DB_HOST'),
          port: +configService.getOrThrow('DB_PORT'),
          username: configService.getOrThrow('DB_USER'),
          password: configService.getOrThrow('DB_PASSWORD'),
          database: configService.getOrThrow('DB_NAME'),
          entities: [...STINGERLOOM_DOMAIN_ENTITIES],
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: isProduction ? false : true,
        };
      },
    }),
  ],
  exports: [StingerloomOrmModule],
})
export class StingerloomDatabaseModule {
  public static isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}
