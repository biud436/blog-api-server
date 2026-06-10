import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { PostComment } from './post-comment.entity';
import { PostCommentService } from './post-comment.service';

@Module({
  imports: [StingerloomOrmModule.forFeature([PostComment])],
  providers: [PostCommentService],
  exports: [PostCommentService],
})
export class PostCommentModule {}
