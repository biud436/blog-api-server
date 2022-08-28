import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostModule } from 'src/entities/post/post.module';
import { CategoryModule } from 'src/entities/category/category.module';
import { CommentsModule } from 'src/entities/comments/comments.module';

@Module({
    imports: [PostModule, CategoryModule, CommentsModule],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
