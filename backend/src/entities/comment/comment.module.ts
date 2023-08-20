import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostComment } from './entities/comment.entity';
import { PaginationModule } from 'src/common/modules/pagination/pagination.module';

@Module({
    imports: [TypeOrmModule.forFeature([PostComment]), PaginationModule],
    providers: [CommentService],
    exports: [CommentService],
})
export class CommentModule {}
