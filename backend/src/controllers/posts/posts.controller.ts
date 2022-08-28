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
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { PaginationConfig } from 'src/common/list-config';
import { DocsMapper } from 'src/common/swagger-config';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/decorators/custom.decorator';
import { Limit } from 'src/decorators/limit.decorator';
import { Offset } from 'src/decorators/offset.decorator';
import { PageNumber } from 'src/decorators/page-number.decorator';
import { CategoryService } from 'src/entities/category/category.service';
import { CreatePostCommentDto } from 'src/entities/comments/dto/create-comment.dto';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { Connection, DataSource } from 'typeorm';
import { PostsService } from './posts.service';

@Controller('posts')
@ApiTags('블로그 API')
export class PostsController {
    private logger: Logger = new Logger(PostsController.name);

    constructor(
        private readonly postsService: PostsService,
        private readonly categoryService: CategoryService,
        private readonly dataSource: DataSource,
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

    @Get(':id')
    @CustomApiOkResponse(DocsMapper.posts.GET.findOne)
    async findOne(@Param('id', ParseIntPipe) postid: number) {
        try {
            const model = await this.postsService.findOne(postid);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, model);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    // @Patch(':id')
    // @AdminOnly()
    // @JwtGuard()
    // @CustomApiOkResponse(DocsMapper.posts.PATCH.update)
    // @ApiParam({
    //     name: 'id',
    //     description: '포스트 ID',
    // })
    // update(
    //     @Param('id', ParseIntPipe) id: number,
    //     @Body() updatePostDto: UpdatePostDto,
    // ) {
    //     return this.postsService.update(id, updatePostDto);
    // }

    // @Delete(':id')
    // @AdminOnly()
    // @JwtGuard()
    // @CustomApiOkResponse(DocsMapper.posts.DELETE.remove)
    // @ApiParam({
    //     name: 'id',
    //     description: '포스트 ID',
    // })
    // remove(@Param('id', ParseIntPipe) id: number) {
    //     return this.postsService.remove(id);
    // }

    // !==========================================================
    // ! Post와 Get Mapping은 맨 아래에 배치해야 합니다.
    // !==========================================================

    @Post()
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse(DocsMapper.posts.POST.create)
    async create(
        @Body()
        createPostDto: CreatePostDto,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const data = await this.postsService.create(
                createPostDto,
                queryRunner,
            );

            this.logger.log(data);

            await queryRunner.commitTransaction();

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
        } catch (e) {
            this.logger.debug(e);

            await queryRunner.rollbackTransaction();
            return ResponseUtil.failureWrap(e);
        } finally {
            await queryRunner.release();
        }
    }

    @Get('/')
    @CustomApiOkResponse(DocsMapper.posts.GET.findAll)
    async findAll(
        @PageNumber('page') page: number,
        @Query('categoryId', ParseIntPipe) categoryId?: number,
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
}
