import { Module } from '@nestjs/common';

import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { PostModule } from './domain/post/post.module';
import { UserModule } from './domain/user/user.module';
import { ProfileModule } from './domain/profile/profile.module';
import { AuthModule } from './controllers/auth/auth.module';
import { AdminModule } from './domain/admin/admin.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './controllers/auth/guards/roles.guard';
import { AllExceptionFilter } from './common/exceptions/AllExceptionFilter.filter';
import { EnvFileMap } from '@app/env/libs/types';
import { PostsModule } from './controllers/posts/posts.module';
import { MailModule } from './common/modules/mail/mail.module';
import { MicroServicesModule } from './common/micro-services/micro-services.module';
import { ImageModule } from './controllers/image/image.module';
import { AesModule } from './common/modules/aes/aes.module';
import { PostViewCountModule } from './domain/post-view-count/post-view-count.module';
import { ApiModule } from './controllers/api/api.module';
import { AdminModule as AdminControllerModule } from './controllers/admin/admin.module';
import { ApiKeyModule } from './domain/api-key/api-key.module';
import { CategoryModule } from './domain/category/category.module';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CategoryGroupModule } from './domain/category-group/category-group.module';
import { BlogMetaDataModule } from './domain/blog-meta-data/blog-meta-data.module';
import { RssModule } from './controllers/rss/rss.module';
import { redisCacheConfig } from './common/micro-services/redis/redis.config';
import { MyBlogConfigModule } from './common/modules/config/my-config.module';
import { XMulterModule } from './common/modules/x-multer/x-multer.module';
import { PrivatePostGuard } from './controllers/auth/guards/private-post.guard';
import { ConnectInfoModule } from './domain/connect-info/connect-info.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { CacheModule } from '@nestjs/cache-manager';
import { TaskModule } from './common/domains/task/task.module';
import { PostCommentModule } from './domain/post-comment/post-comment.module';
import { CommentModule } from './controllers/comment/comment.module';
import { StingerloomDatabaseModule } from './common/modules/stingerloom-database/stingerloom-database.module';

@Module({
  imports: [
    StingerloomDatabaseModule,
    CacheModule.registerAsync(redisCacheConfig),
    ConfigModule.forRoot({
      envFilePath: <EnvFileMap>(
        (AppModule.isDelvelopment() ? '.development.env' : '.env')
      ),
      isGlobal: true,
      cache: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60 * 1000,
        limit: 40,
      },
    ]),
    HttpModule,
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
    ApiModule,
    AdminControllerModule,
    ApiKeyModule,
    CategoryModule,
    CommentModule,
    CategoryGroupModule,
    BlogMetaDataModule,
    RssModule.register({
      title: '어진석의 블로그',
      description: '어진석의 블로그입니다.',
      author: '어진석',
    }),
    MyBlogConfigModule.register({
      isGlobal: true,
    }),
    XMulterModule.forRoot({
      dest: !AppModule.isDelvelopment() ? '/usr/src/app/upload/' : './upload',
    }),
    ConnectInfoModule,
    TaskModule,
    PostCommentModule,
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
  exports: [ThrottlerModule, CacheModule],
})
export class AppModule {
  public static isDelvelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }
}
