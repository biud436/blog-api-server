import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostModule } from 'src/entities/post/post.module';
import { CategoryModule } from 'src/entities/category/category.module';

@Module({
    imports: [PostModule, CategoryModule],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
