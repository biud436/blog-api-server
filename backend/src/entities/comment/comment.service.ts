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

    async createComment(
        createCommentDto: CreateCommentDto,
        userId: number,
        queryRunner: QueryRunner,
    ) {
        const comment = this.commentRepository.create(createCommentDto);
        comment.userId = userId;

        let isExistParent = false;

        // 부모 댓글이 있다면,
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
            } else {
                comment.pos = parentComment.pos + 1;

                const lastPos = await this.commentRepository
                    .createQueryBuilder('comment')
                    .select()
                    .where('comment.parent_id = :parentId', {
                        parentId: parentComment.id,
                    })
                    .andWhere('comment.pos > 0')
                    .orderBy('comment.pos', 'DESC')
                    .setQueryRunner(queryRunner)
                    .getOne();

                if (lastPos) {
                    comment.pos = lastPos.pos + 1;
                }
            }

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
}
