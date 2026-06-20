import { forwardRef, Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostModule } from 'src/domain/post/post.module';
import { CategoryModule } from 'src/domain/category/category.module';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { UserModule } from 'src/domain/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '../auth/auth.module';
import { PostCommentModule } from 'src/domain/post-comment/post-comment.module';
import { CategoryCommand } from './commands/category.command';

@Module({
  imports: [
    PostModule,
    CategoryModule,
    MicroServicesModule,
    UserModule,
    forwardRef(() => AuthModule),
    ConfigModule,
    PostCommentModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, CategoryCommand],
  exports: [PostsService],
})
export class PostsModule {}
