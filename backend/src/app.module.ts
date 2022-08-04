import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { PostModule } from './entities/post/post.module';
import { ConfiguredDatabaseModule } from './modules/configured-database/configured-database.module';
import { UserModule } from './entities/user/user.module';
import { ProfileModule } from './entities/profile/profile.module';
import { AuthModule } from './controllers/auth/auth.module';
import { AdminModule } from './entities/admin/admin.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './controllers/auth/guards/roles.guard';
import { AllExceptionFilter } from './exceptions/AllExceptionFilter.filter';
import { EnvFileMap } from '@app/env/libs/types';
import { PostsModule } from './controllers/posts/posts.module';
import { MailModule } from './modules/mail/mail.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './controllers/health-check/health-check.controller';
import { MicroServicesModule } from './micro-services/micro-services.module';
import { OrmModule } from './modules/orm/orm.module';
import { ImageModule } from './controllers/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { getMyMulterOption } from './common/multer.config';
import { AesModule } from './modules/aes/aes.module';
import { FirstCategoryModule } from './entities/first-category/first-category.module';
import { SecondCategoryModule } from './entities/second-category/second-category.module';
import { PostViewCountModule } from './entities/post-view-count/post-view-count.module';
import { UserCopyModule } from './entities/user-copy/user-copy.module';
import './polyfill/';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import dbconnect from './config';
import { ServerLog } from './utils/ServerLog';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: <EnvFileMap>(
                (AppModule.isDelvelopment() ? '.development.env' : '.env')
            ),
        }),
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
        MulterModule.registerAsync({
            useFactory: () => {
                const isProduction = process.env.NODE_ENV === 'production';

                return {
                    ...getMyMulterOption(isProduction),
                };
            },
        }),
        TerminusModule,
        HttpModule,
        OrmModule,
        UserModule,
        ProfileModule,
        AuthModule,
        PostModule,
        AdminModule,
        PostsModule,
        MailModule,
        MicroServicesModule,
        ImageModule,
        AesModule,
        FirstCategoryModule,
        SecondCategoryModule,
        PostViewCountModule,
        UserCopyModule,
    ],
    controllers: [AppController, HealthCheckController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionFilter,
        },
    ],
})
export class AppModule {
    public static isDelvelopment(): boolean {
        return process.env.NODE_ENV !== 'production';
    }
}
