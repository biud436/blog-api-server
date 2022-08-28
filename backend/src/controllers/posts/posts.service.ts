import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CommentsService } from 'src/entities/comments/comments.service';
import { CreatePostCommentDto } from 'src/entities/comments/dto/create-comment.dto';
import { PostComment } from 'src/entities/comments/entities/comment.entity';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class PostsService {
    constructor(
        private readonly postService: PostService,
        private readonly commentService: CommentsService,
        private readonly dataSource: DataSource,
    ) {}

    async create(createPostDto: CreatePostDto, queryRunner: QueryRunner) {
        return await this.postService.create(createPostDto, queryRunner);
    }

    async findAll(page: number, categoryId?: number) {
        return await this.postService.findAll(page, categoryId);
    }

    async findOne(postId: number) {
        return await this.postService.findOne(postId);
    }

    async writeComment(createCommentDto: CreatePostCommentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const res = await this.commentService.create(
                createCommentDto,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            return res;
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    async readComments(postId: number, parentCommentId: number) {
        const comments = await this.commentService.findCommentTree(
            postId,
            parentCommentId,
        );

        // return comments.map((e) => plainToClass(PostComment, e));
        return comments;
    }
}
