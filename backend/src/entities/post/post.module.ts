import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from './entities/post.repository';

export const PostRepositoryModule = TypeOrmModule.forFeature([PostRepository]);

@Module({
  imports: [PostRepositoryModule],
  providers: [PostService],
  exports: [PostService],
})
export class PostModule {}
