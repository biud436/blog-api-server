import {
    CacheInterceptor,
    CacheModule,
    CacheModuleAsyncOptions,
    MiddlewareConsumer,
    Module,
    NestModule,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { PostModule } from './entities/post/post.module';
import { ConfiguredDatabaseModule } from './common/modules/configured-database/configured-database.module';
import { UserModule } from './entities/user/user.module';
import { ProfileModule } from './entities/profile/profile.module';
import { AuthModule } from './controllers/auth/auth.module';
import { AdminModule } from './entities/admin/admin.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { RolesGuard } from './controllers/auth/guards/roles.guard';
import { AllExceptionFilter } from './common/exceptions/AllExceptionFilter.filter';
import { EnvFileMap } from '@app/env/libs/types';
import { PostsModule } from './controllers/posts/posts.module';
import { MailModule } from './common/modules/mail/mail.module';
import { TerminusModule } from '@nestjs/terminus';
import { HealthCheckController } from './controllers/health-check/health-check.controller';
import { MicroServicesModule } from './common/micro-services/micro-services.module';
import { OrmModule } from './common/modules/orm/orm.module';
import { ImageModule } from './controllers/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { getMyMulterOption } from './common/multer.config';
import { AesModule } from './common/modules/aes/aes.module';
import { PostViewCountModule } from './entities/post-view-count/post-view-count.module';
import { UserCopyModule } from './entities/user-copy/user-copy.module';
import './common/libs/polyfill';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import dbconnect from './config';
import { ServerLog } from './common/libs/logger/ServerLog';
import { ApiModule } from './controllers/api/api.module';
import { AdminModule as AdminControllerModule } from './controllers/admin/admin.module';
import { ApiKeyModule } from './entities/api-key/api-key.module';
import { CategoryModule } from './entities/category/category.module';
import { CommentsModule } from './entities/comments/comments.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DepartmentModule } from './entities/department/department.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CategoryGroupModule } from './entities/category-group/category-group.module';
import { BlogMetaDataModule } from './entities/blog-meta-data/blog-meta-data.module';
import { PostTempModule } from './entities/post-temp/post-temp.module';
import { LoginMiddleware } from './common/middlewares/login.middleware';
import { AopModule } from '@toss/nestjs-aop';
import { SlackModule } from './common/modules/slack/slack.module';
import { RssModule } from './controllers/rss/rss.module';
import { TypeOrmExModule } from './common/modules/typeorm-ex/typeorm-ex.module';
import { redisCacheConfig } from './common/micro-services/redis/redis.config';
import { MyBlogConfigModule } from './common/modules/config/my-config.module';
import { XMulterModule } from './common/modules/x-multer/x-multer.module';
import { HealthCheckModule } from './controllers/health-check/health-check.module';
import { HealthCheckConstant } from './controllers/health-check/health-check.constant';
import { PrivatePostGuard } from './controllers/auth/guards/private-post.guard';
import { ConnectInfoModule } from './entities/connect-info/connect-info.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';

@Module({
    imports: [
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
        CacheModule.registerAsync(redisCacheConfig),
        ConfigModule.forRoot({
            envFilePath: <EnvFileMap>(
                (AppModule.isDelvelopment() ? '.development.env' : '.env')
            ),
            isGlobal: true,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        ScheduleModule.forRoot(),
        ThrottlerModule.forRoot({
            // 1초에 40번까지만 요청 가능
            ttl: 1,
            limit: 40,
        }),
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
        PostViewCountModule,
        UserCopyModule,
        ApiModule,
        AdminControllerModule,
        ApiKeyModule,
        CategoryModule,
        CommentsModule,
        DepartmentModule,
        CategoryGroupModule,
        BlogMetaDataModule,
        PostTempModule,
        AopModule,
        SlackModule,
        RssModule.register({
            title: '어진석의 블로그',
            description: '어진석의 블로그입니다.',
            author: '어진석',
        }),
        TypeOrmExModule,
        MyBlogConfigModule.register({
            isGlobal: true,
        }),
        HealthCheckModule.register({
            pingCheck: {
                url: 'https://google.co.kr',
            },
            checkHeap: {
                heapUsedThreshold: HealthCheckConstant.DEFAULT_HEAP_SIZE,
            },
        }),
        XMulterModule.forRoot({
            dest: !AppModule.isDelvelopment()
                ? '/usr/src/app/upload/'
                : './upload',
        }),
        ConnectInfoModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: PrivatePostGuard,
        },
        {
            provide: APP_GUARD,
            useClass: ThrottlerBehindProxyGuard,
        },
        {
            provide: APP_FILTER,
            useClass: AllExceptionFilter,
        },
    ],
    exports: [ThrottlerModule],
})
export class AppModule {
    public static isDelvelopment(): boolean {
        return process.env.NODE_ENV !== 'production';
    }
}
