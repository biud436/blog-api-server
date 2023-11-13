import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { AuthModule } from '../auth/auth.module';
import { CommentModule } from 'src/entities/comment/comment.module';

@Module({
    imports: [AuthModule, CommentModule],
    controllers: [CommentsController],
    providers: [CommentsService],
})
export class CommentsModule {}
