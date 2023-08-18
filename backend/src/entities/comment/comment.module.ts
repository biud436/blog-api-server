import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './entities/comment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PostComment])],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule {}
