import { Module } from '@nestjs/common';
import { PostCommentService } from './post-comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './entities/post-comment.entity';
import { PaginationModule } from 'src/common/modules/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([PostComment]), PaginationModule],
  providers: [PostCommentService],
  exports: [PostCommentService],
})
export class PostCommentModule {}
