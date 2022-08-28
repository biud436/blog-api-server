import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { QueryRunner, TreeRepository } from 'typeorm';
import { CreatePostCommentDto } from './dto/create-comment.dto';
import { UpdatePostCommentDto } from './dto/update-comment.dto';
import { PostComment } from './entities/comment.entity';

@Injectable()
export class CommentsService {
    constructor(
        @InjectRepository(PostComment)
        private commentRepository: TreeRepository<PostComment>,
    ) {}

    async findParentComment(parentCommentId: number) {
        const parentComment = await this.commentRepository
            .createQueryBuilder('comment')
            .select()
            .where('comment.id = :id', {
                id: parentCommentId,
            })
            .getOneOrFail();

        return parentComment;
    }

    async create(
        createCommentDto: CreatePostCommentDto,
        queryRunner: QueryRunner,
    ) {
        const comment = this.commentRepository.create(createCommentDto);

        if (createCommentDto.parentCommentId) {
            const parentComment = await this.findParentComment(
                createCommentDto.parentCommentId,
            );

            comment.parent = parentComment;
        }

        await queryRunner.manager.save(comment);
    }

    async findCommentTree(
        postId: number,
        parentCommentId: number,
        pageNumber = 1,
    ) {
        const parentComment = await this.findParentComment(parentCommentId);

        const qb = this.commentRepository.createDescendantsQueryBuilder(
            'node',
            'nodeClosure',
            parentComment,
        );

        qb.select(
            "LENGTH(node.mpath) - LENGTH(REPLACE(node.mpath, '.', ''))",
            'depth',
        )
            .addSelect('node.id', 'id')
            .addSelect('node.username', 'username')
            .addSelect('node.content', 'content')
            .addSelect('node.postId', 'postId')
            .addSelect('node.parent_id', 'parentId')
            .addSelect('node.mpath', 'path')
            .where('node.postId = :postId', { postId })
            .addOrderBy('node.mpath', 'ASC')
            .setPaginationWithJoin(pageNumber);

        const nodes = await qb.getRawManyWithPagination(pageNumber);
        nodes.entities.map((e) => plainToClass(CommentNode, e));

        return nodes;
    }
}

export class CommentNode {
    id: number;
    username: string;
    content: string;
    postId: number;
    parentId: number;
    depth: number;
    path: string;

    children: CommentNode[] = [];

    addChild(child: CommentNode) {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }
}
