import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { PostComment } from './post-comment.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([PostComment])],
})
export class PostCommentModule {}
