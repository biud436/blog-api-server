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
    Ip,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { SearchOption } from 'src/common/config/list-config';
import {
    AdminOnly,
    ApiNotebook,
    JwtGuard,
} from 'src/common/decorators/swagger/api-notebook.decorator';
import { PageNumber } from 'src/common/decorators/pagination/page-number.decorator';
import { PostId } from 'src/common/decorators/enhancer/post-id.decorator';
import { UserId } from 'src/common/decorators/authorization/user-id.decorator';
import {
    Anonymous,
    AnonymousId,
    IsPrivatePost,
} from 'src/common/decorators/authorization/anonymous.decorator';
import { CategoryService } from 'src/entities/category/category.service';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { DataSource } from 'typeorm';
import { PrivatePostGuard } from '../auth/guards/private-post.guard';
import { PostsService } from './posts.service';
import { PostSearchProperty } from './types/post-search-type';

@Controller(['post', 'posts'])
@ApiTags('Post')
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
    @ApiNotebook({
        operation: {
            summary: 'Breadcrumbs 정보 조회',
            description: 'Breadcrumbs 정보를 조회합니다.',
        },
        queries: [
            {
                name: 'categoryName',
                description: '카테고리 이름',
            },
        ],
    })
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
    @ApiNotebook({
        operation: {
            summary: '카테고리 정보와 포스트 갯수 조회',
            description: '카테고리 정보와 포스트 갯수를 조회합니다.',
        },
    })
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
     * @summary 새로운 포스트를 생성합니다.
     * @param userId JWT에서 추출한 유저 아이디
     * @param createPostDto  생성할 포스트 정보
     * @returns
     */
    @Post()
    @AdminOnly()
    @JwtGuard()
    @ApiNotebook({
        operation: {
            summary: '포스트 생성',
            description: '포스트를 생성합니다.',
        },
        auth: true,
    })
    async create(
        @UserId() userId: number,
        @Body()
        createPostDto: CreatePostDto,
    ) {
        // TODO: 추후에 이 부분을 @Transactional 데코레이터로 리팩토링합니다.
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
     * 포스트를 검색합니다.
     *
     * @tag Post
     * @param pageNumber 페이지 번호 (1부터 시작)
     * @param searchProperty 검색할 속성 title, content
     * @param searchQuery 검색할 값
     */
    @Get('/search')
    @ApiNotebook({
        operation: {
            summary: '포스트 검색',
            description: '포스트를 검색합니다.',
        },
        queries: [
            {
                name: 'pageNumber',
                description: '페이지 번호 (1부터 시작)',
            },
            {
                name: 'searchProperty',
                description: '검색할 속성',
                enum: ['title', 'content'],
            },
            {
                name: 'searchQuery',
                description: '검색할 값',
            },
        ],
    })
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
    @ApiNotebook({
        operation: {
            summary: '포스트 삭제',
            description: '포스트를 삭제합니다.',
        },
        params: [
            {
                name: 'id',
                description: '포스트 ID',
            },
        ],
        auth: true,
    })
    async deletePost(@PostId() postId: number) {
        return await this.postsService.deletePostById(postId);
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
    @ApiNotebook({
        operation: {
            summary: '포스트 수정',
            description: '포스트를 수정합니다.',
        },
        params: [
            {
                name: 'id',
                description: '포스트 ID',
            },
        ],
        auth: true,
    })
    async updatePost(
        @PostId() postId: number,
        @UserId() userId: number,
        @Body() updatePostDto: UpdatePostDto,
    ) {
        /**
         * TODO: `@Transactional` 데코레이터를 사용하도록 리팩토링이 필요합니다.
         */
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
    @ApiNotebook({
        operation: {
            summary: '포스트 조회',
            description: '포스트를 조회합니다.',
        },
        queries: [
            {
                name: 'page',
                description: '페이지 번호 (1부터 시작)',
            },
            {
                name: 'categoryId',
                description: '카테고리 ID, 생략하면 전체 포스트를 조회합니다.',
                required: false,
            },
        ],
    })
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
    @ApiNotebook({
        operation: {
            summary: '포스트 조회',
            description: '포스트를 조회합니다.',
        },
        params: [
            {
                name: 'id',
                description: '포스트 ID',
            },
        ],
    })
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
