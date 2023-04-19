import {
    CACHE_MANAGER,
    HttpException,
    Inject,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { QueryRunner } from 'typeorm';
import { PostSearchProperty } from './types/post-search-type';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';

@Injectable()
export class PostsService {
    constructor(
        private readonly postService: PostService,
        private readonly redisService: RedisService,
        private readonly categoryService: CategoryService,
    ) {}

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
        try {
            const res = await this.postService.findAll(page, categoryId);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch {
            return ResponseUtil.failure({
                message: '작성된 포스트가 없습니다',
                statusCode: 500,
            });
        }
    }

    /**
     * 특정 포스트를 조회합니다.
     *
     * @param postId
     * @returns
     */
    async findOne(
        postId: number,
        ip: string,
        isPrivate?: boolean,
        anonymousId?: number,
    ) {
        try {
            let totalCount = '0';

            const item = await this.postService.findOne(
                postId,
                isPrivate,
                anonymousId,
            );

            // ip가 이미 조회한 ip인지 확인
            const isViewed = await this.redisService.isViewedPost(postId, ip);

            if (item) {
                if (!isViewed) {
                    // 24시간 이내에 조회한 적이 없다면 조회수 증가
                    await this.redisService.setViewedPost(postId, ip);
                    await this.redisService.increasePostViewCount(postId);
                }

                totalCount = await this.redisService.get(
                    'post_view_count:' + postId,
                );
            }

            const model = {
                ...item,
                viewCount: {
                    count: parseInt(totalCount, 10),
                },
            };

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, model);
        } catch (e: any) {
            throw ResponseUtil.failureWrap({
                message: '포스트를 찾을 수 없거나 비공개 포스트입니다.',
                statusCode: 403,
            });
        }
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
     * 카테고리 별 포스트 갯수 조회
     *
     * @returns
     */
    async getPostCountByCategories() {
        return this.categoryService.getPostCountByCategories();
    }
}
