import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    Logger,
    DefaultValuePipe,
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { SearchOption } from 'src/common/list-config';
import { DocsMapper } from 'src/common/swagger-config';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/decorators/custom.decorator';
import { PageNumber } from 'src/decorators/page-number.decorator';
import { UserId } from 'src/decorators/user-id.decorator';
import { CategoryService } from 'src/entities/category/category.service';
import { CreatePostCommentDto } from 'src/entities/comments/dto/create-comment.dto';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/libs/response/response';
import { ResponseUtil } from 'src/libs/response/ResponseUtil';
import { DataSource } from 'typeorm';
import { PostsService } from './posts.service';
import { PostSearchProperty } from './types/post-search-type';

@Controller('posts')
@ApiTags('블로그 API')
export class PostsController {
    private logger: Logger = new Logger(PostsController.name);

    constructor(
        private readonly postsService: PostsService,
        private readonly categoryService: CategoryService,
        // TODO: typeorm에 너무 강하게 커플링되는 부분
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @Get('/breadcrumbs')
    @ApiOperation({ summary: 'Breadcrumbs 정보 조회' })
    @ApiQuery({
        name: 'categoryName',
        description: '카테고리 이름',
    })
    async getBreadcrumbs(@Query('categoryName') categoryName: string) {
        try {
            const res = await this.categoryService.getBreadcrumbs(categoryName);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch {
            return ResponseUtil.failure({
                message: 'Breadcrumbs 정보를 조회할 수 없습니다.',
                statusCode: 500,
            });
        }
    }

    @Get('/categories')
    @CustomApiOkResponse({
        operation: {
            summary: '카테고리 별 게시글 갯수 조회',
        },
        description: '카테고리 별 게시글 갯수 조회',
    })
    async getPostCountByCategories() {
        try {
            const res = await this.categoryService.getPostCountByCategories();
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failure({
                message: '카테고리 카운트 정보를 조회할 수 없습니다.',
                statusCode: 500,
            });
        }
    }

    @Post('/comment')
    @ApiOperation({ summary: '댓글 작성' })
    async writeComment(@Body() createCommentDto: CreatePostCommentDto) {
        try {
            const data = await this.postsService.writeComment(createCommentDto);
            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, data);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    @Post()
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse(DocsMapper.posts.POST.create)
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
            console.log(e);
            this.logger.debug(e);

            await queryRunner.rollbackTransaction();
            return ResponseUtil.failureWrap(e);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 포스트 검색
     *
     * @param pageNumber 1
     * @param searchProperty title, content
     * @param searchQuery
     */
    @Get('/search')
    @CustomApiOkResponse({
        description: '포스트의 제목 또는 내용을 검색합니다',
        auth: false,
        operation: {},
    })
    @ApiQuery({
        name: 'searchProperty',
        description: '검색할 속성',
        enum: ['title', 'content'],
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
            return ResponseUtil.failureWrap(e);
        }
    }

    // !==========================================================
    // ! Post와 Get Mapping은 맨 아래에 배치해야 합니다.
    // !==========================================================

    @Delete(':id')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        auth: true,
        description: '포스트를 삭제합니다',
        operation: {
            summary: '포스트 삭제',
            description: '포스트를 삭제합니다',
        },
    })
    async deletePost(@Param('id', ParseIntPipe) postId: number) {
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

    @Patch(':id')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        auth: true,
        description: '포스트를 수정합니다',
        operation: {
            summary: '포스트 수정',
            description: '포스트를 수정합니다',
        },
    })
    async updatePost(
        @Param('id', ParseIntPipe) postId: number,
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

    @Get('/')
    @CustomApiOkResponse(DocsMapper.posts.GET.findAll)
    @ApiQuery({
        name: 'categoryId',
        description: '카테고리 ID',
        required: false,
    })
    async findAll(
        @PageNumber('page') page: number,
        /**
         * optional이므로, ParseIntPipe를 제외하였음.
         */
        @Query('categoryId') categoryId?: number,
    ) {
        try {
            const res = await this.postsService.findAll(page, categoryId);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch {
            return ResponseUtil.failure({
                message: '작성된 포스트가 없습니다',
                statusCode: 500,
            });
        }
    }

    @Get('/:id/comment')
    @ApiOperation({ summary: '댓글 조회' })
    @ApiParam({
        name: 'id',
        description: '포스트 아이디',
    })
    @ApiQuery({
        name: 'parentCommentId',
        description: '부모 댓글 아이디',
    })
    async readComments(
        @Param('id', ParseIntPipe) postId: number,
        @PageNumber('page') pageNumber: number,
        @Query('parentCommentId', ParseIntPipe) parentCommentId?: number,
    ) {
        try {
            const res = await this.postsService.readComments(
                postId,
                parentCommentId,
                pageNumber,
            );
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failure(e);
        }
    }

    @Get(':id')
    @CustomApiOkResponse(DocsMapper.posts.GET.findOne)
    async findOne(@Param('id', ParseIntPipe) postId: number) {
        try {
            const model = await this.postsService.findOne(postId);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, model);
        } catch (e) {
            return ResponseUtil.failureWrap({
                message: '포스트를 찾을 수 없습니다',
                statusCode: 403,
            });
        }
    }
}
