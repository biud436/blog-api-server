import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostModule } from 'src/entities/post/post.module';
import { CategoryModule } from 'src/entities/category/category.module';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { UserModule } from 'src/entities/user/user.module';
import { SlackModule } from 'src/common/modules/slack/slack.module';
import { JwtModule } from '@nestjs/jwt';
import { PrivatePostGuard } from '../auth/guards/private-post.guard';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from '../auth/auth.module';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { UserCopyModule } from 'src/entities/user-copy/user-copy.module';

@Module({
    imports: [
        PostModule,
        CategoryModule,
        MicroServicesModule,
        UserModule,
        forwardRef(() => AuthModule),
        ConfigModule,
    ],
    controllers: [PostsController],
    providers: [PostsService],
    exports: [PostsService],
})
export class PostsModule {}
