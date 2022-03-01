import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ServerLog } from 'src/utils/ServerLog';
import dbconnect from './config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (
        configService: ConfigService,
      ): Promise<TypeOrmModuleOptions> => {
        const config = dbconnect(configService);
        if (ConfiguredDatabaseModule.isDelvelopment()) {
          ServerLog.info('개발 DB입니다.');
          return config.dev;
        } else {
          ServerLog.info('프로덕션 DB입니다.');
          return config.production;
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class ConfiguredDatabaseModule {
  public static isDelvelopment(): boolean {
    const env = process.env;
    if ('npm_config_argv' in env) {
      const argv = JSON.parse(env.npm_config_argv);
      if (argv.cooked.includes('start:dev')) {
        return true;
      }
    }
    return false;
  }
}
