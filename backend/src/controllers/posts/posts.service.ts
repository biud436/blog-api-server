import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToClass } from 'class-transformer';
import { CommentsService } from 'src/entities/comments/comments.service';
import { CreatePostCommentDto } from 'src/entities/comments/dto/create-comment.dto';
import { PostComment } from 'src/entities/comments/entities/comment.entity';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';
import { RedisService } from 'src/micro-services/redis/redis.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
export class PostsService {
    constructor(
        private readonly postService: PostService,
        private readonly commentService: CommentsService,
        private readonly dataSource: DataSource,
        private readonly redisService: RedisService,
    ) {}

    /**
     * 레디스에 적재된 조회수를 새벽에 RDBMS에 배치합니다.
     */
    @Cron('0 0 0 * * *')
    async redisBatchStart() {
        const keys = await this.redisService.getKeys('post_view_count:*');
        if (keys.length > 0) {
            for (const key of keys) {
                const postId = parseInt(key.split(':')[1], 10);
                const cnt = parseInt(await this.redisService.get(key), 10);

                await this.postService.updateViewCount(postId, cnt);
            }
        }
    }

    async create(createPostDto: CreatePostDto, queryRunner: QueryRunner) {
        return await this.postService.create(createPostDto, queryRunner);
    }

    async findAll(page: number, categoryId?: number) {
        return await this.postService.findAll(page, categoryId);
    }

    async findOne(postId: number) {
        await this.redisService.increasePostViewCount(postId);
        const cnt = await this.redisService.get('post_view_count:' + postId);

        const item = await this.postService.findOne(postId);

        return {
            ...item,
            viewCount: {
                count: parseInt(cnt, 10),
            },
        };
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

    async readComments(
        postId: number,
        parentCommentId: number,
        pageNumber = 1,
    ) {
        const comments = await this.commentService.findCommentTree(
            postId,
            parentCommentId,
            pageNumber,
        );

        // return comments.map((e) => plainToClass(PostComment, e));
        return comments;
    }
}
