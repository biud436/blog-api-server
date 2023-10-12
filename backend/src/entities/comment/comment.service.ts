import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from './entities/comment.entity';
import { QueryRunner, Repository, TreeRepository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';

type CommentOrder = 'ASC' | 'DESC';

@Injectable()
export class CommentService implements OnModuleInit {
    constructor(
        @InjectRepository(PostComment)
        private readonly commentRepository: Repository<PostComment>,
        private readonly paginationProvider: PaginationProvider,
    ) {}

    async onModuleInit() {
        // await this.commentRepository.delete({});
    }

    /**
     * 새로운 댓글을 생성합니다.
     */
    async createComment(createCommentDto: CreateCommentDto, userId: number) {
        const comment = this.commentRepository.create(createCommentDto);
        comment.userId = userId;

        let isExistParent = false;

        // 부모 댓글이 있을 경우
        if (createCommentDto.parentId) {
            const qb = this.commentRepository.createQueryBuilder('comment');

            qb.select()
                .where('comment.id = :id', { id: createCommentDto.parentId })
                .andWhere('comment.postId = :postId', {
                    postId: createCommentDto.postId,
                });

            const parentComment = await qb.getOne();

            if (!parentComment) {
                throw new BadRequestException('부모 댓글이 존재하지 않습니다.');
            }

            comment.parent = parentComment;
            comment.parentId = parentComment.id;

            const order = 'ASC' as CommentOrder;

            if (order === 'DESC') {
                await this.createNodeWithDESC(
                    comment,
                    createCommentDto,
                    parentComment,
                );
            } else {
                await this.createNodeWithASC(
                    comment,
                    createCommentDto,
                    parentComment,
                );
            }

            // depth 처리
            if (this.isZeroOrMore(createCommentDto.depth)) {
                comment.depth = createCommentDto.depth! + 1;
            }

            isExistParent = true;
        }

        const result = await this.commentRepository.save(comment);

        if (!isExistParent) {
            comment.parentId = result.id;
        }

        return await this.commentRepository.save(comment);
    }

    private async createNodeWithDESC(
        comment: PostComment,
        createCommentDto: CreateCommentDto,
        parentComment: PostComment,
    ) {
        // pos 처리
        if (this.isZeroOrMore(createCommentDto.pos)) {
            comment.pos = createCommentDto.pos! + 1;
        }

        // 나머지 댓글들 pos + 1
        await this.commentRepository
            .createQueryBuilder('comment')
            .update()
            .set({
                pos: () => 'pos + 1',
            })
            .where('parentId = :parentId', {
                parentId: parentComment.id,
            })
            .andWhere('pos >= :pos', {
                pos: comment.pos,
            })
            .execute();
    }

    private async createNodeWithASC(
        comment: PostComment,
        createCommentDto: CreateCommentDto,
        parentComment: PostComment,
    ) {
        // 마지막 댓글을 가져옵니다.
        const listItems = await this.commentRepository
            .createQueryBuilder('comment')
            .select()
            .where('comment.parentId = :parentId', {
                parentId: parentComment.id,
            })
            .andWhere('comment.id != :id', {
                id: parentComment.id,
            })
            .addOrderBy('comment.pos', 'DESC')
            .getOne();

        if (listItems) {
            // 마지막 댓글의 위치를 가져옵니다.
            const lastPos = listItems.pos;

            // 마지막 댓글의 바로 다음 위치에 댓글을 생성합니다.
            comment.pos = lastPos + 1;

            // 새로 생성된 댓글의 바로 다음 위치부터 모든 댓글의 위치를 +1 합니다.
            await this.commentRepository
                .createQueryBuilder('comment')
                .update()
                .set({
                    pos: () => 'pos + 1',
                })
                .where('parentId = :parentId', {
                    parentId: parentComment.id,
                })
                .andWhere('pos > :pos', {
                    pos: comment.pos,
                })
                .execute();
        } else {
            // pos 처리
            if (this.isZeroOrMore(createCommentDto.pos)) {
                comment.pos = createCommentDto.pos! + 1;
            }
        }
    }

    private isZeroOrMore(value: number | undefined | null) {
        if (value === undefined || value === null) {
            return false;
        }

        if (value >= 0) {
            return true;
        }

        return false;
    }

    /**
     * 모든 댓글을 조회합니다.
     *
     * @param postId
     * @param pageNumber
     * @param pageSize
     * @returns
     */
    async findAll(postId: number, pageNumber: number, pageSize: number) {
        const qb = this.commentRepository.createQueryBuilder('comment');

        const roots = qb
            .select()
            .where('comment.postId = :postId', { postId })
            .orderBy('comment.parentId', 'ASC')
            .addOrderBy('comment.pos', 'ASC');

        const items = await this.paginationProvider.execute(
            roots,
            pageNumber,
            pageSize,
        );

        return items;
    }

    /**
     * 접힌 댓글만 조회합니다.
     *
     * @param postId 포스트 ID
     * @param pageNumber
     * @param pageSize
     * @returns
     */
    async findAllByRoot(postId: number, pageNumber: number, pageSize: number) {
        const qb = this.commentRepository.createQueryBuilder('comment');

        qb.select()
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.depth = :depth', { depth: 0 })
            .andWhere('comment.pos = :pos', { pos: 0 })
            .orderBy('comment.parentId', 'ASC')
            .addOrderBy('comment.pos', 'ASC');

        const items = await this.paginationProvider.execute(
            qb,
            pageNumber,
            pageSize,
        );

        return items;
    }

    /**
     * 특정 댓글의 접힌 댓글을 조회합니다.
     *
     * @param postId 포스트 ID
     * @param parentId 부모 댓글의 ID
     * @param pageNumber
     * @param pageSize
     * @returns
     */
    async findAllByParentId(
        postId: number,
        parentId: number,
        pageNumber: number,
        pageSize: number,
    ) {
        const qb = this.commentRepository.createQueryBuilder('comment');

        qb.select()
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.parentId = :parentId', { parentId })
            .andWhere('comment.id != :parentId', { parentId })
            .orderBy('comment.pos', 'ASC');

        const items = await this.paginationProvider.execute(
            qb,
            pageNumber,
            pageSize,
        );

        return items;
    }

    /**
     * 자식을 가진 댓글인지 확인합니다.
     *
     * @param postId
     * @param commentId
     * @param queryRunner
     * @returns
     */
    private async hasChildren(postId: number, commentId: number) {
        const qb = this.commentRepository.createQueryBuilder('comment');

        // 기준 댓글 조회
        const targetComment = await qb
            .select()
            .where('comment.id = :commentId', { commentId })
            .getOneOrFail();

        const { depth, pos } = targetComment;

        // 기준 댓글의 자식 댓글 조회
        const children = await qb
            .select()
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.depth > :depth', { depth })
            .andWhere('comment.pos > :pos', { pos })
            .getMany();

        if (children.length > 0) {
            return true;
        }

        return false;
    }

    /**
     * 조상 댓글이 있는지 확인합니다.
     *
     * @param postId
     * @param commentId
     * @param queryRunner
     * @returns
     */
    private async isAncestor(
        postId: number,
        commentId: number,
        queryRunner: QueryRunner,
    ) {
        const qb = this.commentRepository.createQueryBuilder(
            'comment',
            queryRunner,
        );

        // 기준 댓글 조회
        const targetComment = await qb
            .select()
            .where('comment.id = :commentId', { commentId })
            .setQueryRunner(queryRunner)
            .useTransaction(true)
            .getOneOrFail();

        const { depth, pos } = targetComment;

        // 기준 댓글이 루트 댓글일 경우, false 반환
        if (depth === 0 && pos === 0) {
            return false;
        }

        // 기준 댓글의 조상 댓글 조회
        const ancestors = await qb
            .select()
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.depth < :depth', { depth })
            .andWhere('comment.pos < :pos', { pos })
            .orderBy('comment.depth', 'DESC')
            .addOrderBy('comment.pos', 'DESC')
            .setQueryRunner(queryRunner)
            .useTransaction(true)
            .getMany();

        // 조상 댓글이 있을 경우, true 반환
        if (ancestors.length > 0) {
            return true;
        }

        return false;
    }

    /**
     * 댓글 작성자가 맞는지 확인합니다.
     *
     * @param postId
     * @param commentId
     * @param userId
     * @param queryRunner
     * @returns
     */
    private async isCommentAuthor(
        postId: number,
        commentId: number,
        userId: number,
    ) {
        const qb = this.commentRepository
            .createQueryBuilder('comment')
            .select()
            .where('comment.postId = :postId', { postId })
            .andWhere('comment.id = :id', { id: commentId });

        const comment = await qb.getOneOrFail();

        if (comment.userId !== userId) {
            return false;
        }

        return true;
    }

    /**
     * 댓글을 삭제합니다.
     *
     * @param postId
     * @param commentId
     * @param userId
     * @param queryRunner
     * @returns
     */
    async deleteComment(postId: number, commentId: number, userId: number) {
        // 댓글 작성자가 아닐 경우
        if (!(await this.isCommentAuthor(postId, commentId, userId))) {
            throw new BadRequestException('댓글 작성자가 아닙니다.');
        }

        const hasChildren = await this.hasChildren(postId, commentId);

        // 답글이 달려있을 경우
        if (hasChildren) {
            const updateResult = await this.commentRepository
                .createQueryBuilder('comment')
                .update()
                .set({
                    content: '삭제된 댓글입니다.',
                    deletedAt: new Date(),
                })
                .where('id = :id', { id: commentId })
                .execute();

            return updateResult;
        }

        // 답글이 없을 경우
        const deleteResult = await this.commentRepository
            .createQueryBuilder('comment')
            .delete()
            .where('id = :id', { id: commentId })
            .execute();

        return deleteResult;
    }
}
