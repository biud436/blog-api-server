import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostComment } from './entities/comment.entity';
import { QueryRunner, Repository, TreeRepository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';

@Injectable()
export class CommentService implements OnModuleInit {
    constructor(
        @InjectRepository(PostComment)
        private readonly commentRepository: Repository<PostComment>,
        private readonly paginationProvider: PaginationProvider,
    ) {}

    async onModuleInit() {
        // remove all comments
        // await this.commentRepository.delete({});
    }

    /**
     * 새로운 댓글을 생성합니다.
     */
    async createComment(
        createCommentDto: CreateCommentDto,
        userId: number,
        queryRunner: QueryRunner,
    ) {
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

            // pos 처리
            if (createCommentDto.pos) {
                comment.pos = createCommentDto.pos + 1;
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
                .setQueryRunner(queryRunner)
                .useTransaction(true)
                .execute();

            // depth 처리
            if (createCommentDto.depth) {
                comment.depth = createCommentDto.depth + 1;
            }

            isExistParent = true;
        }

        const result = await queryRunner.manager.save(comment);

        if (!isExistParent) {
            comment.parentId = result.id;
        }

        return await queryRunner.manager.save(comment);
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
     * @param postId
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
}