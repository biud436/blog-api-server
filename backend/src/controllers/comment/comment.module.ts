import { Module } from '@nestjs/common';
import { CommentService as CommentService } from './comment.service';
import { CommentController as CommentController } from './comment.controller';
import { AuthModule } from '../auth/auth.module';
import { PostCommentModule } from 'src/domain/post-comment/post-comment.module';
import { UserModule } from 'src/domain/user/user.module';

@Module({
  imports: [AuthModule, UserModule, PostCommentModule],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
