import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Query,
    DefaultValuePipe,
    ParseBoolPipe,
    ParseIntPipe,
} from '@nestjs/common';
import { UserId } from 'src/common/decorators/authorization';
import { PostId } from 'src/common/decorators/enhancer/post-id.decorator';
import { PageNumber } from 'src/common/decorators/pagination/page-number.decorator';
import { PageSize } from 'src/common/decorators/pagination/page-size.decorator';
import {
    ApiNotebook,
    JwtGuard,
} from 'src/common/decorators/swagger/api-notebook.decorator';
import { CreateCommentDto } from 'src/entities/comment/dto/create-comment.dto';
import { CommentService } from './comment.service';

@Controller('comment')
export class CommentController {
    constructor(private readonly commentService: CommentService) {}

    /**
     * 접혀있는 댓글을 조회합니다.
     *
     * @tag Post
     * @param id 포스트 ID
     * @param parentId 부모 댓글 ID
     * @param pageNumber 페이지 번호 (1부터 시작)
     * @param pageSize 페이지 사이즈
     */
    @Get('/:id/by-parent')
    @ApiNotebook({
        operation: {
            summary: '접혀있는 댓글 조회',
            description: '접혀있는 댓글을 조회합니다.',
        },
        params: [
            {
                name: 'id',
                description: '포스트 ID',
            },
        ],
        queries: [
            {
                name: 'parentId',
                description: '부모 댓글 ID',
            },
            {
                name: 'pageNumber',
                description: '페이지 번호 (1부터 시작)',
            },
            {
                name: 'pageSize',
                description: '페이지 사이즈',
            },
        ],
    })
    async getCommentsByParentId(
        @PostId() postId: number,
        @Query('parentId', ParseIntPipe) parentId: number,
        @PageNumber() pageNumber: number,
        @PageSize() pageSize: number,
    ) {
        return await this.commentService.getCommentsByParentId(
            postId,
            parentId,
            pageNumber,
            pageSize,
        );
    }

    /**
     * 특정 댓글을 삭제합니다.
     *
     * @tag Post
     * @param id 포스트 ID
     * @param commentId 댓글 ID
     */
    @Delete('/:id')
    @JwtGuard()
    @ApiNotebook({
        operation: {
            summary: '댓글 삭제',
            description: '댓글을 삭제합니다.',
        },
        params: [
            {
                name: 'id',
                description: '포스트 ID',
            },
            {
                name: 'commentId',
                description: '댓글 ID',
            },
        ],
        auth: true,
    })
    async deleteComment(
        @PostId() postId: number,
        @Query('commentId', ParseIntPipe) commentId: number,
        @UserId() userId: number,
    ) {
        return await this.commentService.deleteComment(
            postId,
            commentId,
            userId,
        );
    }

    /**
     * 새로운 댓글을 작성합니다.
     *
     * @tag Post
     * @param userId JWT에서 추출한 유저 아이디
     * @param createCommentDto 생성할 댓글 정보
     */
    @Post()
    @JwtGuard()
    @ApiNotebook({
        operation: {
            summary: '댓글 생성',
            description: '댓글을 생성합니다.',
        },
        auth: true,
    })
    async createComment(
        @UserId() userId: number,
        @Body() createCommentDto: CreateCommentDto,
    ) {
        return await this.commentService.createComment(
            createCommentDto,
            userId,
        );
    }

    /**
     * 댓글을 조회합니다.
     *
     * @tag Post
     * @param id 포스트 ID
     * @param pageNumber 페이지 번호 (1부터 시작)
     * @param pageSize 페이지 사이즈
     * @param expand 댓글을 펼칠 지 접을 지 여부
     * @returns
     */
    @Get(':id')
    @ApiNotebook({
        operation: {
            summary: '댓글 조회',
            description: '댓글을 조회합니다.',
        },
        params: [
            {
                name: 'id',
                description: '포스트 ID',
            },
        ],
    })
    async getComments(
        @PostId() postId: number,
        @PageNumber() pageNumber: number,
        @PageSize() pageSize: number,
        @Query('expand', new DefaultValuePipe(true), ParseBoolPipe)
        isExpand: boolean = true,
    ) {
        return await this.commentService.getComments(
            postId,
            pageNumber,
            pageSize,
            isExpand,
        );
    }
}
