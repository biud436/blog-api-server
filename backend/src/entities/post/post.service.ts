import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { encodeHtml } from 'src/common/html-escpse';
import { ImageService } from 'src/controllers/image/image.service';
import { PostSearchProperty } from 'src/controllers/posts/types/post-search-type';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { QueryRunner, Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { ConfigData } from 'src/common/modules/config/types/my-config.decorator';
import { Paginatable } from 'src/common/list-config';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly categoryService: CategoryService,
        private readonly imageService: ImageService,
        private readonly redisService: RedisService,
    ) {}

    /**
     * 포스트를 작성합니다.
     *
     * @param createPostDto
     * @param queuryRunner
     * @returns
     */
    async create(createPostDto: CreatePostDto, queuryRunner: QueryRunner) {
        if (createPostDto.title) {
            createPostDto.title = encodeHtml(createPostDto.title);
        }
        if (createPostDto.content) {
            createPostDto.content = encodeHtml(createPostDto.content);
        }

        const model = this.postRepository.create(createPostDto);
        const now = DateTimeUtil.toDate(DateTimeUtil.now());
        model.uploadDate = now;

        if (!model.categoryId) {
            throw new BadRequestException('카테고리를 선택해주세요.');
        }

        if (!model.authorId) {
            throw new BadRequestException('작성자가 없습니다.');
        }

        const imageIds = await this.redisService.getTemporarilyImageIds(
            model.authorId + '',
        );

        let resultImageIds: number[] = [];
        if (imageIds) {
            resultImageIds = imageIds.map((e) => +e).filter((e) => !isNaN(e));
        }

        // 배열에서 NaN 제거
        if (resultImageIds.length > 0) {
            const images = await this.imageService.findByIds(resultImageIds);
            model.images = images;
        }

        let post = await queuryRunner.manager.save(model);

        if (post.images && post.images.length > 0) {
            post.images = post.images.map((e) => {
                return {
                    ...e,
                    postId: post.id,
                };
            });

            for (let i = 0; i < post.images.length; i++) {
                const image = post.images[i];
                await this.redisService.deleteTemporarilyImageIds(
                    model.authorId + '',
                    image.id + '',
                );
            }

            post = await queuryRunner.manager.save(post);
        }

        return post;
    }

    /**
     * 기존 포스트를 수정 합니다.
     *
     * @param postId
     * @param updatePostDto
     * @param queuryRunner
     * @returns
     */
    async updatePost(
        postId: number,
        updatePostDto: UpdatePostDto,
        queuryRunner: QueryRunner,
    ) {
        if (updatePostDto.title) {
            updatePostDto.title = encodeHtml(updatePostDto.title);
        }
        if (updatePostDto.content) {
            updatePostDto.content = encodeHtml(updatePostDto.content);
        }

        const updateResult = await this.postRepository
            .createQueryBuilder('post')
            .update(Post)
            .set({
                ...updatePostDto,
                updatedAt: () => `CURRENT_TIMESTAMP`,
            })
            .where('id = :postId', { postId })
            .andWhere('deletedAt IS NULL')
            .execute();

        if (updateResult.affected === 0) {
            throw new BadRequestException('수정할 포스트가 없습니다.');
        }

        const model = await this.findOne(postId);

        // 이미지 처리 작업
        const imageIds = await this.redisService.getTemporarilyImageIds(
            model.authorId + '',
        );

        let resultImageIds: number[] = [];
        if (imageIds) {
            resultImageIds = imageIds.map((e) => +e).filter((e) => !isNaN(e));
        }

        if (resultImageIds.length > 0) {
            const images = await this.imageService.findByIds(resultImageIds);
            model.images = images;
        }

        let post = await queuryRunner.manager.save(model);

        if (post.images && post.images.length > 0) {
            post.images = post.images.map((e) => {
                return {
                    ...e,
                    postId: post.id,
                };
            });

            for (let i = 0; i < post.images.length; i++) {
                const image = post.images[i];
                await this.redisService.deleteTemporarilyImageIds(
                    model.authorId + '',
                    image.id + '',
                );
            }

            post = await queuryRunner.manager.save(post);
        }

        return post;
    }

    /**
     * 기존 포스트를 삭제합니다.
     */
    async deletePostById(postId: number, queuryRunner: QueryRunner) {
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
                await this.imageService.deleteByIds(ids, queuryRunner);
            }
        }

        // 포스트를 삭제합니다.
        const deleteResult = await this.postRepository
            .createQueryBuilder('post')
            .delete()
            .from(Post)
            .where('id = :id', { id: postId })
            .setQueryRunner(queuryRunner)
            .execute();

        return deleteResult;
    }

    /**
     * 포스트 조회
     *
     * @param postId
     * @returns
     */
    async findOne(postId: number, isPrivate?: boolean, anonymousId?: number) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('post.images', 'images')
            .where('post.deletedAt IS NULL')
            .andWhere('post.id = :postId', { postId });

        if (isPrivate) {
            qb.andWhere('post.isPrivate >= 0');
            qb.andWhere('user.id = :anonymousId', { anonymousId });
        } else {
            qb.andWhere('post.isPrivate = 0');
        }

        const item = await qb.getOneOrFail();

        return plainToClass(Post, item);
    }

    /**
     * 포스트 페이징 조회
     *
     * @param pageNumber
     * @param categoryId
     * @returns
     */
    async findAll(pageNumber: number, categoryId?: number) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('post.images', 'images')
            .where('post.deletedAt IS NULL');

        if (categoryId) {
            const descendants = await this.categoryService.selectDescendants(
                categoryId,
            );

            const ids = descendants.map((e) => e.id);

            qb.andWhere('post.categoryId IN (:...ids)', { ids });
        }

        // 비공개 포스트는 조회하지 않습니다.
        qb.andWhere('post.isPrivate = 0');

        qb.orderBy('post.uploadDate', 'DESC');

        const items = await qb
            .setPagination(pageNumber)
            .getManyWithPagination(pageNumber);

        items.entities = items.entities.map((e) => {
            delete e.content;
            return plainToClass(Post, e);
        });

        return items;
    }

    async findAllByUserId(
        pageNumber: number,
        userId: number,
    ): Promise<Paginatable<Post>> {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select('post.id', 'id')
            .addSelect('post.title', 'title')
            .addSelect('post.uploadDate', 'uploadDate')
            .addSelect('post.isPrivate', 'isPrivate')
            .leftJoinAndSelect('post.category', 'category')
            .where('post.deletedAt IS NULL')
            .andWhere('post.userId = :userId', { userId })
            .setPaginationWithJoin(pageNumber);

        return await qb.getManyWithPagination(pageNumber);
    }

    /**
     * 사이트맵 조회 (최근 100건)
     */
    async getPostSitemap() {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select('post.id', 'id')
            .limit(100)
            .where('post.deletedAt IS NULL')
            .orderBy('post.uploadDate', 'DESC')
            .getRawMany();

        const items = await qb;

        const sitemap = items.map((e) => {
            return e.id;
        });

        return sitemap;
    }

    /**
     * 포스트 검색
     *
     * @param pageNumber 페이지 번호
     * @param searchProperty 검색 타입
     * @param searchQuery 검색 쿼리
     * @returns
     */
    async searchPost(
        pageNumber: number,
        searchProperty: PostSearchProperty,
        searchQuery: string,
    ) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('post.deletedAt IS NULL');

        if (searchProperty === 'title') {
            qb.andWhere('post.title LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            });
        } else if (searchProperty === 'content') {
            qb.andWhere('post.content LIKE :searchQuery', {
                searchQuery: `%${searchQuery}%`,
            });
        }

        qb.andWhere('post.isPrivate = 0');

        qb.orderBy('post.uploadDate', 'DESC');

        const items = await qb
            .setPagination(pageNumber)
            .getManyWithPagination(pageNumber);

        items.entities = items.entities.map((e) => plainToClass(Post, e));

        return items;
    }
}
