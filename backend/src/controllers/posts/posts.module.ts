import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostModule } from 'src/entities/post/post.module';

@Module({
    imports: [PostModule],
    controllers: [PostsController],
    providers: [PostsService],
})
export class PostsModule {}
