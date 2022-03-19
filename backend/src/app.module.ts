import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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

@Module({
  imports: [
    PostModule,
    ConfigModule.forRoot({
      envFilePath: <EnvFileMap>(
        (AppModule.isDelvelopment() ? '.development.env' : '.env')
      ),
      isGlobal: true,
    }),
    ConfiguredDatabaseModule,
    MulterModule.registerAsync({
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';

        return {
          dest: isProduction ? '/usr/src/app/upload/' : './upload',
        };
      },
    }),
    TerminusModule,
    HttpModule,
    UserModule,
    ProfileModule,
    AuthModule,
    AdminModule,
    PostsModule,
    MailModule,
    MicroServicesModule,
    OrmModule,
    ImageModule,
  ],
  controllers: [AppController, HealthCheckController],
  providers: [
    AppService,
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
