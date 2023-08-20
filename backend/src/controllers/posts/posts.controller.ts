import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    Query,
    ParseIntPipe,
    Logger,
    DefaultValuePipe,
    UseGuards,
    Req,
    Ip,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { SearchOption } from 'src/common/config/list-config';
import { DocsMapper } from 'src/common/config/swagger-config';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { PageNumber } from 'src/common/decorators/page-number.decorator';
import { PostId } from 'src/common/decorators/post-id.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';
import {
    Anonymous,
    AnonymousId,
    IsPrivatePost,
} from 'src/common/decorators/anonymous.decorator';
import { CategoryService } from 'src/entities/category/category.service';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { DataSource } from 'typeorm';
import { PrivatePostGuard } from '../auth/guards/private-post.guard';
import { PostsService } from './posts.service';
import { PostSearchProperty } from './types/post-search-type';

import { TypedQuery, TypedRoute } from '@nestia/core';
import { CreateCommentDto } from 'src/entities/comment/dto/create-comment.dto';
import { PageSize } from 'src/common/decorators/page-size.decorator';

@Controller(['post', 'posts'])
export class PostsController {
    private logger: Logger = new Logger(PostsController.name);

    constructor(
        private readonly postsService: PostsService,
        private readonly categoryService: CategoryService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    /**
     * breadcrumbs 정보를 조회합니다.
     *
     * @tag Post
     * @param categoryName 카테고리 이름
     * @returns
     */
    @Get('/breadcrumbs')
    async getBreadcrumbs(@Query() categoryName: string) {
        try {
            const res = await this.categoryService.getBreadcrumbs(categoryName);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch {
            throw ResponseUtil.failure({
                message: 'Breadcrumbs 정보를 조회할 수 없습니다.',
                statusCode: 500,
            });
        }
    }

    /**
     * 카테고리 정보와 포스트 갯수를 조회합니다.
     *
     * @tag Post
     * @returns
     */
    @Get('/categories')
    async getPostCountByCategories() {
        try {
            const res = await this.categoryService.getPostCountByCategories();
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            throw ResponseUtil.failure({
                message: '카테고리 카운트 정보를 조회할 수 없습니다.',
                statusCode: 500,
            });
        }
    }

    /**
     * 새로운 포스트를 생성합니다 (관리자만 가능)
     *
     * @tag Post
     * @param userId JWT에서 추출한 유저 아이디
     * @param createPostDto  생성할 포스트 정보
     * @returns
     */
    @Post()
    @AdminOnly()
    @JwtGuard()
    async create(
        @UserId() userId: number,
        @Body()
        createPostDto: CreatePostDto,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        delete createPostDto.authorId;
        createPostDto.authorId = userId;

        try {
            const data = await this.postsService.create(
                createPostDto,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
        } catch (e) {
            this.logger.debug(e);

            await queryRunner.rollbackTransaction();
            throw ResponseUtil.failureWrap({
                statusCode: 500,
                message: '포스트를 작성할 수 없습니다.',
                name: 'INTERNAL_SERVER_ERROR',
            });
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 댓글을 조회합니다.
     *
     * @tag Post
     * @param id 댓글 ID
     * @param pageNumber 페이지 번호 (1부터 시작)
     * @param pageSize 페이지 사이즈
     * @returns
     */
    @Get('/:id/comment')
    async getComments(
        @PostId() postId: number,
        @PageNumber('pageNumber') pageNumber: number,
        @PageSize() pageSize: number,
    ) {
        return await this.postsService.getComments(
            postId,
            pageNumber,
            pageSize,
        );
    }

    /**
     * 새로운 댓글을 작성합니다.
     *
     * @tag Post
     * @param userId JWT에서 추출한 유저 아이디
     * @param createCommentDto 생성할 댓글 정보
     */
    @Post('/comment')
    @JwtGuard()
    async createComment(
        @UserId() userId: number,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return await this.postsService.createComment(createCommentDto, userId);
    }

    /**
     * 포스트를 검색합니다.
     *
     * @tag Post
     * @param pageNumber 페이지 번호 (1부터 시작)
     * @param searchProperty 검색할 속성 title, content
     * @param searchQuery 검색할 값
     */
    @Get('/search')
    async searchPost(
        @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
        pageNumber: number,
        @Query('searchProperty', new DefaultValuePipe('title'))
        searchProperty: PostSearchProperty,
        @Query('searchQuery') searchQuery: string,
    ) {
        try {
            const res = await this.postsService.searchPost(
                pageNumber,
                searchProperty,
                SearchOption.handleQuery(searchQuery),
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            throw ResponseUtil.FAILED_SEARCH;
        }
    }

    // !==========================================================
    // ! Post와 Get Mapping은 맨 아래에 배치해야 합니다.
    // !==========================================================

    /**
     * 포스트를 삭제합니다.
     *
     * @tag Post
     * @param postId
     * @returns
     */
    @Delete(':id')
    @AdminOnly()
    @JwtGuard()
    async deletePost(@PostId() postId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const res = await this.postsService.deleteOne(postId, queryRunner);

            await queryRunner.commitTransaction();

            return ResponseUtil.success(RESPONSE_MESSAGE.DELETE_SUCCESS, res);
        } catch (e: any) {
            await queryRunner.rollbackTransaction();
            return ResponseUtil.failureWrap(e);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 포스트를 수정합니다.
     *
     * @tag Post
     * @param postId 포스트 ID
     * @param userId 유저 ID
     * @param updatePostDto 수정할 포스트 정보
     * @returns
     */
    @Patch(':id')
    @AdminOnly()
    @JwtGuard()
    async updatePost(
        @PostId() postId: number,
        @UserId() userId: number,
        @Body() updatePostDto: UpdatePostDto,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        delete updatePostDto.authorId;
        updatePostDto.authorId = userId;

        try {
            const res = await this.postsService.updateOne(
                postId,
                updatePostDto,
                queryRunner,
            );

            await queryRunner.commitTransaction();

            return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
        } catch (e: any) {
            await queryRunner.rollbackTransaction();
            return ResponseUtil.failureWrap(e);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 포스트를 페이지 단위로 조회합니다.
     *
     * @tag Post
     * @param page 페이지 번호 (1부터 시작)
     * @param categoryId 카테고리 ID, 생략하면 전체 포스트를 조회합니다.
     * @returns
     */
    @Get('/')
    async findAll(
        @PageNumber('page') page: number,
        @Query('categoryId') categoryId?: number,
    ) {
        return await this.postsService.findAll(page, categoryId);
    }

    /**
     * 포스트를 조회합니다.
     *
     * @tag Post
     * @param postId 조회할 포스트 번호
     * @param ip 클라이언트 IP (중복 조회 방지 용도)
     * @param isPrivatePost 비공개 포스트 여부
     * @param anonymousId 익명 아이디
     * @returns
     */

    @Get(':id')
    @Anonymous()
    @UseGuards(PrivatePostGuard)
    async findOne(
        @PostId() postId: number,
        @Ip() ip: string,
        @IsPrivatePost() isPrivatePost?: boolean,
        @AnonymousId() anonymousId?: number,
    ) {
        return await this.postsService.findOne(
            postId,
            ip,
            isPrivatePost,
            anonymousId,
        );
    }
}
