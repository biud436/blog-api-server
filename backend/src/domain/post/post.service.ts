import { BadRequestException, Injectable } from '@nestjs/common';
import removeMarkdown from 'markdown-to-text';
import { BaseRepository, Transactional, qAlias } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { encodeHtml } from 'src/common/config/html-escpse';
import {
  Paginatable,
  PaginationConfig,
  PaginationResult,
} from 'src/common/config/list-config';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { S3Service } from 'src/common/micro-services/s3/s3.service';
import { PostSearchProperty } from 'src/controllers/posts/types/post-search-type';
import type { Image as S3ImageFile } from 'src/controllers/image/entities/image.entity';
import { CreatePostDto } from '../../entities/post/dto/create-post.dto';
import { UpdatePostDto } from '../../entities/post/dto/update-post.dto';
import { Category } from '../category/category.entity';
import { Image } from '../image/image.entity';
import { ImageService } from '../image/image.service';
import { User } from '../user/user.entity';
import { Post } from './post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: BaseRepository<Post>,
    @InjectRepository(Image)
    private readonly imageRepository: BaseRepository<Image>,
    @InjectRepository(Category)
    private readonly categoryRepository: BaseRepository<Category>,
    private readonly imageService: ImageService,
    private readonly redisService: RedisService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * 포스트를 작성합니다.
   *
   * Redis 에 임시 보관된 업로드 이미지 ID 들을 포스트에 연결한다.
   * 기존 구현은 save() 의 관계 cascade 로 image.postId 를 채웠으나,
   * 여기서는 ImageService.updatePostId 로 명시적으로 연결한다.
   */
  @Transactional()
  async create(createPostDto: CreatePostDto): Promise<Post> {
    if (createPostDto.title) {
      createPostDto.title = encodeHtml(createPostDto.title);
    }
    if (createPostDto.content) {
      createPostDto.content = encodeHtml(createPostDto.content);
    }

    const now = DateTimeUtil.toDate(DateTimeUtil.now());

    if (!now) {
      throw new BadRequestException('날짜가 잘못되었습니다.');
    }

    if (!createPostDto.categoryId) {
      throw new BadRequestException('카테고리를 선택해주세요.');
    }

    if (!createPostDto.authorId) {
      throw new BadRequestException('작성자가 없습니다.');
    }

    const model: Partial<Post> = {
      title: createPostDto.title,
      content: createPostDto.content,
      categoryId: createPostDto.categoryId,
      authorId: createPostDto.authorId,
      isPrivate: createPostDto.isPrivate,
      uploadDate: now,
    };

    const post = await this.postRepository.save(model);

    const resultImageIds = await this.getTemporarilyImageIds(
      createPostDto.authorId,
    );

    if (resultImageIds.length > 0) {
      const images = await this.imageService.findByIds(resultImageIds);

      await this.imageService.updatePostId(
        post.id,
        images.map((e) => e.id),
      );

      for (const image of images) {
        await this.redisService.deleteTemporarilyImageIds(
          createPostDto.authorId + '',
          image.id + '',
        );
      }

      post.images = images.map((e) => ({ ...e, postId: post.id }));
    }

    return post;
  }

  /**
   * 기존 포스트를 수정합니다.
   *
   * updatedAt 은 @UpdateTimestamp 주입으로 자동 갱신된다
   * (기존 구현의 `updatedAt = CURRENT_TIMESTAMP` 와 동일).
   */
  @Transactional()
  async updatePost(postId: number, updatePostDto: UpdatePostDto): Promise<Post> {
    if (updatePostDto.title) {
      updatePostDto.title = encodeHtml(updatePostDto.title);
    }
    if (updatePostDto.content) {
      updatePostDto.content = encodeHtml(updatePostDto.content);
    }

    const p = qAlias(Post, 'post');

    const patch: Partial<Post> = {
      title: updatePostDto.title,
      content: updatePostDto.content,
    };
    if (updatePostDto.categoryId !== undefined) {
      patch.categoryId = updatePostDto.categoryId;
    }
    if (updatePostDto.authorId !== undefined) {
      patch.authorId = updatePostDto.authorId;
    }

    const updateResult = await this.postRepository
      .createUpdateBuilder(p)
      .set(patch)
      .where(p.id.eq(postId))
      .andWhere(p.deletedAt.isNull())
      .execute();

    if (updateResult.affected === 0) {
      throw new BadRequestException('There is no post to update.');
    }

    const model = await this.findOne(postId);

    // 이미지 처리 작업
    const resultImageIds = await this.getTemporarilyImageIds(model.authorId);

    if (resultImageIds.length > 0) {
      const images = await this.imageService.findByIds(resultImageIds);

      await this.imageService.updatePostId(
        model.id,
        images.map((e) => e.id),
      );

      for (const image of images) {
        await this.redisService.deleteTemporarilyImageIds(
          model.authorId + '',
          image.id + '',
        );
      }

      model.images = images.map((e) => ({ ...e, postId: model.id }));
    }

    return model;
  }

  /**
   * 기존 포스트를 삭제합니다 (hard delete).
   *
   * 연관 이미지는 S3 삭제 요청 후 DB 에서도 제거한다.
   */
  async deletePostById(postId: number) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['images'],
    });

    if (!post) {
      throw new BadRequestException('삭제할 포스트가 존재하지 않습니다.');
    }

    // 연관된 이미지가 있는 경우, S3에 이미지 삭제 요청을 합니다.
    if (post.images && post.images.length > 0) {
      const ids = post.images.map((e) => e.id);
      if (ids && ids.length > 0) {
        await this.s3Service.deleteFile(
          post.images as unknown as S3ImageFile[],
        );
        await this.imageService.deleteByIds(ids);
      }
    }

    // 포스트를 삭제합니다.
    return await this.postRepository.delete({ id: postId });
  }

  /**
   * 포스트 조회
   *
   * deletedAt IS NULL 필터는 @DeletedAt 컬럼이라 자동 적용된다.
   */
  async findOne(
    postId: number,
    isPrivate?: boolean,
    anonymousId?: number,
  ): Promise<Post> {
    const p = qAlias(Post, 'post');
    const u = qAlias(User, 'user');

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinRelationAndSelect('post.user', 'user')
      .leftJoinRelationAndSelect('post.category', 'category')
      .leftJoinRelationAndSelect('user.profile', 'profile')
      .where(p.id.eq(postId));

    if (isPrivate) {
      qb.andWhere(p.isPrivate.gte(0));
      qb.andWhere(u.id.eq(anonymousId));
    } else {
      qb.andWhere(p.isPrivate.eq(false));
    }

    const item = await qb.getOneOrFail();

    // QB 는 OneToMany 를 중첩 로드하지 않으므로 2단계로 하이드레이션.
    item.images = await this.imageRepository.find({
      where: { postId: item.id },
    });

    return this.withPreview(item);
  }

  /**
   * 포스트 페이징 조회
   */
  async findAll(
    pageNumber: number,
    categoryId?: number,
    pageSize?: number,
  ): Promise<Paginatable<Post>> {
    const p = qAlias(Post, 'post');
    const size = pageSize || PaginationConfig.limit.numberPerPage;
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinRelationAndSelect('post.user', 'user')
      .leftJoinRelationAndSelect('post.category', 'category')
      .leftJoinRelationAndSelect('user.profile', 'profile');

    if (categoryId) {
      const descendants = await this.selectCategoryDescendants(categoryId);
      const ids = descendants.map((e) => e.id);
      qb.where(p.categoryId.in(ids));
    }

    const rows = await qb
      .orderBy({ uploadDate: 'DESC' })
      .limit(size)
      .offset((safePage - 1) * size)
      .getMany();

    // 기존 구현 유지: totalCount 는 카테고리 필터 없이 전체 개수를 사용한다.
    const totalCount = await this.postRepository
      .createQueryBuilder('post')
      .getCount();

    await this.attachImages(rows);

    const items = this.toPaginatable(rows, totalCount, safePage, size);

    items.entities = items.entities.map((e) => {
      this.withPreview(e);
      e.content = e.isPrivate ? '비공개 글입니다' : e.content.slice(0, 30);
      return e;
    });

    return items;
  }

  /**
   * 포스트 검색
   *
   * @param pageNumber 페이지 번호
   * @param searchProperty 검색 타입
   * @param searchQuery 검색 쿼리
   */
  async searchPost(
    pageNumber: number,
    searchProperty: PostSearchProperty,
    searchQuery: string,
  ): Promise<Paginatable<Post>> {
    const p = qAlias(Post, 'post');
    const size = PaginationConfig.limit.numberPerPage;
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinRelationAndSelect('post.user', 'user')
      .leftJoinRelationAndSelect('post.category', 'category')
      .leftJoinRelationAndSelect('user.profile', 'profile')
      .where(p.isPrivate.eq(false));

    if (searchProperty === 'title') {
      qb.andWhere(p.title.like(`%${searchQuery}%`));
    } else if (searchProperty === 'content') {
      qb.andWhere(p.content.like(`${searchQuery}%`));
    }

    const [rows, total] = await qb
      .orderBy({ uploadDate: 'DESC' })
      .limit(size)
      .offset((safePage - 1) * size)
      .getManyAndCount();

    const items = this.toPaginatable(rows, total, safePage, size);

    items.entities = items.entities.map((e) => {
      this.withPreview(e);
      e.content = e.isPrivate ? '비공개 글입니다' : e.content.slice(0, 30);
      return e;
    });

    return items;
  }

  /**
   * 공개 포스트 피드 조회
   */
  async getFeed(
    pageNumber: number,
    categoryId?: number,
  ): Promise<Paginatable<Post>> {
    const p = qAlias(Post, 'post');
    const size = PaginationConfig.limit.numberPerPage;
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinRelationAndSelect('post.user', 'user')
      .leftJoinRelationAndSelect('post.category', 'category')
      .leftJoinRelationAndSelect('user.profile', 'profile')
      // 비공개 포스트는 조회하지 않습니다.
      .where(p.isPrivate.eq(false));

    if (categoryId) {
      const descendants = await this.selectCategoryDescendants(categoryId);
      const ids = descendants.map((e) => e.id);
      qb.andWhere(p.categoryId.in(ids));
    }

    const [rows, total] = await qb
      .orderBy({ uploadDate: 'DESC' })
      .limit(size)
      .offset((safePage - 1) * size)
      .getManyAndCount();

    await this.attachImages(rows);

    const items = this.toPaginatable(rows, total, safePage, size);

    items.entities = items.entities.map((e) => this.withPreview(e));

    return items;
  }

  /**
   * 특정 작성자의 포스트 목록 조회
   *
   * 기존 구현은 존재하지 않는 `post.userId` 컬럼을 참조했으나,
   * 의도(작성자 필터)에 맞게 author_id 를 사용한다.
   */
  async findAllByUserId(
    pageNumber: number,
    userId: number,
  ): Promise<Paginatable<Post>> {
    const p = qAlias(Post, 'post');
    const size = PaginationConfig.limit.numberPerPage;
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const [rows, total] = await this.postRepository
      .createQueryBuilder('post')
      .leftJoinRelationAndSelect('post.category', 'category')
      .where(p.authorId.eq(userId))
      .limit(size)
      .offset((safePage - 1) * size)
      .getManyAndCount();

    return this.toPaginatable(rows, total, safePage, size);
  }

  /**
   * 중첩 집합(nested set) 트리에서 대상 카테고리와 그 모든 하위 카테고리를 조회.
   * TODO(Phase 4): domain CategoryService 가 생기면 그쪽으로 이동.
   */
  private async selectCategoryDescendants(
    categoryId: number,
  ): Promise<Category[]> {
    const node = qAlias(Category, 'node');

    const targetNode = await this.categoryRepository
      .createQueryBuilder('node')
      .where(node.id.eq(categoryId))
      .getOneOrFail();

    return await this.categoryRepository
      .createQueryBuilder('node')
      .where(node.left.between(targetNode.left, targetNode.right))
      .getMany();
  }

  /**
   * Redis 에 임시 보관된 업로드 이미지 ID 목록을 가져온다.
   */
  private async getTemporarilyImageIds(authorId: number): Promise<number[]> {
    const imageIds = await this.redisService.getTemporarilyImageIds(
      authorId + '',
    );

    if (!imageIds) {
      return [];
    }

    // 배열에서 NaN 제거
    return imageIds.map((e) => +e!).filter((e) => !isNaN(e));
  }

  /**
   * QB 는 OneToMany(images) 를 중첩 로드하지 않으므로 별도 조회로 채운다.
   */
  private async attachImages(rows: Post[]): Promise<void> {
    const postIds = rows.map((e) => e.id);

    const images = postIds.length
      ? await this.imageRepository.find({
          where: { postId: { in: postIds } },
        })
      : [];

    for (const row of rows) {
      row.images = images.filter((image) => image.postId === row.id);
    }
  }

  /**
   * 서브스크라이버 afterLoad 와 동일한 previewContent 계산
   * (stingerloom QB 결과에는 afterLoad 가 발화하지 않음).
   */
  private withPreview(post: Post): Post {
    post.previewContent = removeMarkdown(post.content)?.slice(0, 100);
    return post;
  }

  private toPaginatable(
    entities: Post[],
    total: number,
    page: number,
    pageSize: number,
  ): Paginatable<Post> {
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
