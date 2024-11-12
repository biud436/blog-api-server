import { Injectable, Logger } from '@nestjs/common';
import { Paginatable } from 'src/common/config/list-config';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { PostCommentService } from 'src/entities/comment/post-comment.service';
import { CreateCommentDto } from 'src/entities/comment/dto/create-comment.dto';
import { PostComment } from 'src/entities/comment/entities/post-comment.entity';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class CommentService {
    private readonly logger: Logger = new Logger(CommentService.name);

    constructor(private readonly commentService: PostCommentService) {}

    @Transactional()
    async createComment(createCommentDto: CreateCommentDto, userId: number) {
        const res = await this.commentService.createComment(
            createCommentDto,
            userId,
        );

        return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
    }

    @Transactional()
    async getComments(
        postId: number,
        pageNumber: number,
        pageSize: number,
        isExpand = true,
    ) {
        try {
            let items: Paginatable<PostComment>;

            if (isExpand) {
                // 댓글을 모두 펼쳐서 조회합니다.
                items = await this.commentService.findAll(
                    postId,
                    pageNumber,
                    pageSize,
                );
            } else {
                // 댓글이 접혀있는 상태로 조회합니다.
                items = await this.commentService.findAllByRoot(
                    postId,
                    pageNumber,
                    pageSize,
                );
            }

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, items);
        } catch (e: any) {
            throw ResponseUtil.failureWrap(e);
        }
    }

    @Transactional()
    async getCommentsByParentId(
        postId: number,
        parentId: number,
        pageNumber: number,
        pageSize: number,
    ) {
        try {
            const items = await this.commentService.findAllByParentId(
                postId,
                parentId,
                pageNumber,
                pageSize,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, items);
        } catch (e: any) {
            throw ResponseUtil.failureWrap(e);
        }
    }

    /**
     * 댓글 삭제
     *
     * @param postId
     * @param commentId
     * @param userId
     * @returns
     */
    @Transactional()
    async deleteComment(postId: number, commentId: number, userId: number) {
        const res = await this.commentService.deleteComment(
            postId,
            commentId,
            userId,
        );

        return ResponseUtil.success(RESPONSE_MESSAGE.DELETE_SUCCESS, res);
    }
}
