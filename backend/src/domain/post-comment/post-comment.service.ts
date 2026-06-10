import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BaseRepository,
  Transactional,
  qAlias,
  sql,
} from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import {
  Paginatable,
  PaginationConfig,
  PaginationResult,
} from '../../common/config/list-config';
import { CreateCommentDto } from '../../entities/comment/dto/create-comment.dto';
import { PostComment } from './post-comment.entity';

type CommentOrder = 'ASC' | 'DESC';

@Injectable()
export class PostCommentService {
  constructor(
    @InjectRepository(PostComment)
    private readonly commentRepository: BaseRepository<PostComment>,
  ) {}

  /**
   * 새로운 댓글을 생성합니다.
   *
   * 부모 댓글 검증 → 형제 pos 시프트 → 저장이 같은 트랜잭션으로 묶인다.
   * 루트 댓글은 자기 자신의 id 를 parentId 로 갖는다 (기존 구현과 동일).
   */
  @Transactional()
  async createComment(
    createCommentDto: CreateCommentDto,
    userId: number,
  ): Promise<PostComment> {
    const comment: Partial<PostComment> = {
      postId: createCommentDto.postId,
      content: createCommentDto.content,
      pos: createCommentDto.pos,
      depth: createCommentDto.depth,
      parentId: createCommentDto.parentId,
      userId,
    };

    let isExistParent = false;

    // 부모 댓글이 있을 경우
    if (createCommentDto.parentId) {
      const c = qAlias(PostComment, 'comment');

      const parentComment = await this.commentRepository
        .createQueryBuilder('comment')
        .where(c.id.eq(createCommentDto.parentId))
        .andWhere(c.postId.eq(createCommentDto.postId))
        .getOne();

      if (!parentComment) {
        throw new BadRequestException('부모 댓글이 존재하지 않습니다.');
      }

      comment.parentId = parentComment.id;

      const order = 'ASC' as CommentOrder;

      if (order === 'DESC') {
        await this.createNodeWithDESC(comment, createCommentDto, parentComment);
      } else {
        await this.createNodeWithASC(comment, createCommentDto, parentComment);
      }

      // depth 처리
      if (this.isZeroOrMore(createCommentDto.depth)) {
        comment.depth = createCommentDto.depth! + 1;
      }

      isExistParent = true;
    }

    const result = await this.commentRepository.save(comment);

    if (!isExistParent) {
      result.parentId = result.id;
      return await this.commentRepository.save(result);
    }

    return result;
  }

  private async createNodeWithDESC(
    comment: Partial<PostComment>,
    createCommentDto: CreateCommentDto,
    parentComment: PostComment,
  ): Promise<void> {
    // pos 처리
    if (this.isZeroOrMore(createCommentDto.pos)) {
      comment.pos = createCommentDto.pos! + 1;
    }

    const c = qAlias(PostComment, 'comment');

    // 나머지 댓글들 pos + 1
    await this.commentRepository
      .createUpdateBuilder(c)
      .setRaw('pos', sql`pos + 1`)
      .where(c.parentId.eq(parentComment.id))
      .andWhere(c.pos.gte(comment.pos ?? 0))
      .execute();
  }

  private async createNodeWithASC(
    comment: Partial<PostComment>,
    createCommentDto: CreateCommentDto,
    parentComment: PostComment,
  ): Promise<void> {
    const c = qAlias(PostComment, 'comment');

    // 마지막 댓글을 가져옵니다.
    const lastItem = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.parentId.eq(parentComment.id))
      .andWhere(c.id.neq(parentComment.id))
      .orderBy({ pos: 'DESC' })
      .getOne();

    if (lastItem) {
      // 마지막 댓글의 바로 다음 위치에 댓글을 생성합니다.
      comment.pos = lastItem.pos + 1;

      // 새로 생성된 댓글의 바로 다음 위치부터 모든 댓글의 위치를 +1 합니다.
      await this.commentRepository
        .createUpdateBuilder(c)
        .setRaw('pos', sql`pos + 1`)
        .where(c.parentId.eq(parentComment.id))
        .andWhere(c.pos.gt(comment.pos))
        .execute();
    } else {
      // pos 처리
      if (this.isZeroOrMore(createCommentDto.pos)) {
        comment.pos = createCommentDto.pos! + 1;
      }
    }
  }

  private isZeroOrMore(value: number | undefined | null): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    return value >= 0;
  }

  /**
   * 모든 댓글을 조회합니다.
   */
  async findAll(
    postId: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Paginatable<PostComment>> {
    const c = qAlias(PostComment, 'comment');
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const [rows, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinRelationAndSelect('comment.user', 'user')
      .where(c.postId.eq(postId))
      .orderBy({ parentId: 'ASC', pos: 'ASC' })
      .limit(pageSize)
      .offset((safePage - 1) * pageSize)
      .getManyAndCount();

    return this.toPaginatable(rows, total, safePage, pageSize);
  }

  /**
   * 접힌 댓글(루트 댓글)만 조회합니다.
   */
  async findAllByRoot(
    postId: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Paginatable<PostComment>> {
    const c = qAlias(PostComment, 'comment');
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const [rows, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.postId.eq(postId))
      .andWhere(c.depth.eq(0))
      .andWhere(c.pos.eq(0))
      .orderBy({ parentId: 'ASC', pos: 'ASC' })
      .limit(pageSize)
      .offset((safePage - 1) * pageSize)
      .getManyAndCount();

    return this.toPaginatable(rows, total, safePage, pageSize);
  }

  /**
   * 특정 댓글의 접힌 댓글(직계 답글)을 조회합니다.
   */
  async findAllByParentId(
    postId: number,
    parentId: number,
    pageNumber: number,
    pageSize: number,
  ): Promise<Paginatable<PostComment>> {
    const c = qAlias(PostComment, 'comment');
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const [rows, total] = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.postId.eq(postId))
      .andWhere(c.parentId.eq(parentId))
      .andWhere(c.id.neq(parentId))
      .orderBy({ pos: 'ASC' })
      .limit(pageSize)
      .offset((safePage - 1) * pageSize)
      .getManyAndCount();

    return this.toPaginatable(rows, total, safePage, pageSize);
  }

  /**
   * 자식을 가진 댓글인지 확인합니다.
   */
  private async hasChildren(
    postId: number,
    commentId: number,
  ): Promise<boolean> {
    const c = qAlias(PostComment, 'comment');

    // 기준 댓글 조회
    const targetComment = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.id.eq(commentId))
      .getOneOrFail();

    const { depth, pos } = targetComment;

    // 기준 댓글의 자식 댓글 조회
    const children = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.postId.eq(postId))
      .andWhere(c.depth.gt(depth))
      .andWhere(c.pos.gt(pos))
      .getMany();

    return children.length > 0;
  }

  /**
   * 조상 댓글이 있는지 확인합니다.
   *
   * 기존 구현은 QueryRunner 를 인자로 전파했으나, 호출 측이 `@Transactional()`
   * 컨텍스트면 AsyncLocalStorage 로 같은 트랜잭션에 자동 합류하므로 인자가 없다.
   */
  private async isAncestor(postId: number, commentId: number): Promise<boolean> {
    const c = qAlias(PostComment, 'comment');

    // 기준 댓글 조회
    const targetComment = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.id.eq(commentId))
      .getOneOrFail();

    const { depth, pos } = targetComment;

    // 기준 댓글이 루트 댓글일 경우, false 반환
    if (depth === 0 && pos === 0) {
      return false;
    }

    // 기준 댓글의 조상 댓글 조회
    const ancestors = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.postId.eq(postId))
      .andWhere(c.depth.lt(depth))
      .andWhere(c.pos.lt(pos))
      .orderBy({ depth: 'DESC', pos: 'DESC' })
      .getMany();

    return ancestors.length > 0;
  }

  /**
   * 댓글 작성자가 맞는지 확인합니다.
   */
  private async isCommentAuthor(
    postId: number,
    commentId: number,
    userId: number,
  ): Promise<boolean> {
    const c = qAlias(PostComment, 'comment');

    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .where(c.postId.eq(postId))
      .andWhere(c.id.eq(commentId))
      .getOneOrFail();

    return comment.userId === userId;
  }

  /**
   * 댓글을 삭제합니다.
   *
   * 답글이 달려 있으면 내용을 마스킹한 soft delete, 없으면 hard delete.
   */
  @Transactional()
  async deleteComment(postId: number, commentId: number, userId: number) {
    // 댓글 작성자가 아닐 경우
    if (!(await this.isCommentAuthor(postId, commentId, userId))) {
      throw new BadRequestException('댓글 작성자가 아닙니다.');
    }

    const hasChildren = await this.hasChildren(postId, commentId);

    // 답글이 달려있을 경우
    if (hasChildren) {
      return await this.commentRepository.updateMany(
        {
          content: '삭제된 댓글입니다.',
          deletedAt: new Date(),
        },
        { where: { id: commentId } },
      );
    }

    // 답글이 없을 경우
    return await this.commentRepository.delete({ id: commentId });
  }

  private toPaginatable(
    entities: PostComment[],
    total: number,
    page: number,
    pageSize: number,
  ): Paginatable<PostComment> {
    const maxPage = Math.ceil(total / pageSize);
    const currentPage = page > maxPage && maxPage > 0 ? maxPage : page;
    const pagePerBlock = PaginationConfig.limit.pagePerBlock;
    const pagination: PaginationResult = {
      currentPage,
      totalCount: total,
      maxPage,
      currentBlock: Math.ceil(currentPage / pagePerBlock),
      maxBlock: Math.ceil(maxPage / pagePerBlock),
    };

    return { pagination, entities };
  }
}
