import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { plainToClass } from 'class-transformer';
import { decodeHtml, encodeHtml } from 'src/common/html-escpse';
import { CommentsService } from 'src/entities/comments/comments.service';
import { CreatePostCommentDto } from 'src/entities/comments/dto/create-comment.dto';
import { PostComment } from 'src/entities/comments/entities/comment.entity';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';
import { RedisService } from 'src/micro-services/redis/redis.service';
import { DataSource, QueryRunner } from 'typeorm';
import { PostSearchProperty } from './types/post-search-type';

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
            // TODO: bull.js 사용 필요
            for (const key of keys) {
                const postId = parseInt(key.split(':')[1], 10);
                const cnt = parseInt(await this.redisService.get(key), 10);

                // await this.postService.updateViewCount(postId, cnt);
            }
        }
    }

    /**
     * 포스트를 생성합니다.
     *
     * @param createPostDto
     * @param queryRunner
     * @returns
     */
    async create(createPostDto: CreatePostDto, queryRunner: QueryRunner) {
        return await this.postService.create(createPostDto, queryRunner);
    }

    /**
     * 모든 글을 조회합니다.
     *
     * @param page
     * @param categoryId
     * @returns
     */
    async findAll(page: number, categoryId?: number) {
        return await this.postService.findAll(page, categoryId);
    }

    /**
     * 특정 포스트를 조회합니다.
     *
     * @param postId
     * @returns
     */
    async findOne(postId: number) {
        let totalCount = '0';

        const item = await this.postService.findOne(postId);

        if (item) {
            await this.redisService.increasePostViewCount(postId);
            totalCount = await this.redisService.get(
                'post_view_count:' + postId,
            );
        }

        return {
            ...item,
            viewCount: {
                count: parseInt(totalCount, 10),
            },
        };
    }

    /**
     * 포스트 수정
     *
     * @param postId
     * @param updatePostDto
     * @param queryRunner
     * @returns
     */
    async updateOne(
        postId: number,
        updatePostDto: UpdatePostDto,
        queryRunner: QueryRunner,
    ) {
        return await this.postService.updatePost(
            postId,
            updatePostDto,
            queryRunner,
        );
    }

    /**
     * 포스트 삭제
     *
     * @param postId
     * @param queuryRunner
     * @returns
     */
    async deleteOne(postId: number, queuryRunner: QueryRunner) {
        return await this.postService.deletePostById(postId, queuryRunner);
    }

    /**
     * 포스트 검색
     *
     * @param pageNumber
     * @param searchProperty
     * @param searchQuery
     * @returns
     */
    async searchPost(
        pageNumber: number,
        searchProperty: PostSearchProperty,
        searchQuery: string,
    ) {
        return this.postService.searchPost(
            pageNumber,
            searchProperty,
            searchQuery,
        );
    }

    /**
     * 댓글 작성
     *
     * @deprecated
     * @param createCommentDto
     * @returns
     */
    async writeComment(createCommentDto: CreatePostCommentDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (createCommentDto.content) {
                createCommentDto.content = encodeHtml(createCommentDto.content);
            }

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

    /**
     * 댓글 조회
     *
     * @deprecated
     * @param postId
     * @param parentCommentId
     * @param pageNumber
     * @returns
     */
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

        return comments;
    }
}
