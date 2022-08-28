import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { PostComment } from './entities/comment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PostComment])],
    providers: [CommentsService],
    exports: [CommentsService],
})
export class CommentsModule {}
