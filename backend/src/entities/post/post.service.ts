/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { encodeHtml } from 'src/common/config/html-escpse';
import { ImageService } from 'src/controllers/image/image.service';
import { PostSearchProperty } from 'src/controllers/posts/types/post-search-type';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { QueryRunner, Repository } from 'typeorm';
import { CategoryService } from '../category/category.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Paginatable, PaginationConfig } from 'src/common/config/list-config';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';
import {
    PaginationGetStrategy,
    PaginationStrategy,
} from 'src/common/modules/pagination/pagination.constant';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
        private readonly categoryService: CategoryService,
        private readonly imageService: ImageService,
        private readonly redisService: RedisService,
        private readonly paginationProvider: PaginationProvider,
    ) {}

    /**
     * 포스트를 작성합니다.
     *
     * @param createPostDto
     * @param queuryRunner
     * @returns
     */
    async create(createPostDto: CreatePostDto) {
        if (createPostDto.title) {
            createPostDto.title = encodeHtml(createPostDto.title);
        }
        if (createPostDto.content) {
            createPostDto.content = encodeHtml(createPostDto.content);
        }

        const model = this.postRepository.create(createPostDto);
        const now = DateTimeUtil.toDate(DateTimeUtil.now());

        if (!now) {
            throw new BadRequestException('날짜가 잘못되었습니다.');
        }

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
            resultImageIds = imageIds.map((e) => +e!).filter((e) => !isNaN(e));
        }

        // 배열에서 NaN 제거
        if (resultImageIds.length > 0) {
            const images = await this.imageService.findByIds(resultImageIds);
            model.images = images;
        }

        let post = await this.postRepository.save(model);

        if (post.images?.length > 0) {
            const len = post.images.length;
            post.images = post.images.map((e) => {
                return {
                    ...e,
                    postId: post.id,
                };
            });

            for (let i = 0; i < len; i++) {
                const image = post.images[i];
                await this.redisService.deleteTemporarilyImageIds(
                    model.authorId + '',
                    image.id + '',
                );
            }

            post = await this.postRepository.save(post);
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
    async updatePost(postId: number, updatePostDto: UpdatePostDto) {
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
            throw new BadRequestException('There is no post to update.');
        }

        const model = await this.findOne(postId);

        // 이미지 처리 작업
        const imageIds = await this.redisService.getTemporarilyImageIds(
            model.authorId + '',
        );

        let resultImageIds: number[] = [];
        if (imageIds) {
            resultImageIds = imageIds.map((e) => +e!).filter((e) => !isNaN(e));
        }

        const isValidImageIds = resultImageIds.length > 0;

        if (isValidImageIds) {
            const images = await this.imageService.findByIds(resultImageIds);
            model.images = images;
        }

        let post = await this.postRepository.save(model);
        if (post.images?.length > 0) {
            const len = post.images.length;
            post.images = post.images.map((e) => {
                return {
                    ...e,
                    postId: post.id,
                };
            });

            for (let i = 0; i < len; i++) {
                const image = post.images[i];
                await this.redisService.deleteTemporarilyImageIds(
                    model.authorId + '',
                    image.id + '',
                );
            }

            post = await this.postRepository.save(post);
        }

        return post;
    }

    /**
     * 기존 포스트를 삭제합니다.
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
                await this.imageService.deleteByIds(ids);
            }
        }

        // 포스트를 삭제합니다.
        const deleteResult = await this.postRepository
            .createQueryBuilder('post')
            .delete()
            .from(Post)
            .where('id = :id', { id: postId })
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
    async findAll(pageNumber: number, categoryId?: number, pageSize?: number) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('post.images', 'images')
            .where('post.deletedAt IS NULL');

        if (categoryId) {
            const descendants =
                await this.categoryService.selectDescendants(categoryId);

            const ids = descendants.map((e) => e.id);

            qb.andWhere('post.categoryId IN (:...ids)', { ids });
        }

        const totalCount = await this.postRepository
            .createQueryBuilder('post')
            .select()
            .where('post.deletedAt IS NULL')
            .getCount();

        qb.orderBy('post.uploadDate', 'DESC');

        const items = await this.paginationProvider.execute(
            qb,
            pageNumber,
            pageSize || PaginationConfig.limit.numberPerPage,
            PaginationGetStrategy.GET_MANY,
            PaginationStrategy.OFFSET,
            totalCount,
        );

        if (!items) {
            throw new BadRequestException('포스트가 존재하지 않습니다.');
        }

        items.entities = items.entities.map((e) => {
            e.content = e.isPrivate
                ? '비공개 글입니다'
                : e.content.slice(0, 30);
            return plainToClass(Post, e);
        });

        return items;
    }

    /**
     * 포스트 페이징 조회
     *
     * @param pageNumber
     * @param categoryId
     * @returns
     */
    async getFeed(pageNumber: number, categoryId?: number) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('post.images', 'images')
            .where('post.deletedAt IS NULL');

        if (categoryId) {
            const descendants =
                await this.categoryService.selectDescendants(categoryId);

            const ids = descendants.map((e) => e.id);

            qb.andWhere('post.categoryId IN (:...ids)', { ids });
        }

        // 비공개 포스트는 조회하지 않습니다.
        qb.andWhere('post.isPrivate = 0');

        qb.orderBy('post.uploadDate', 'DESC');

        const items = await this.paginationProvider
            .setPagination(qb, pageNumber)
            .getManyWithPagination(qb, pageNumber);

        if (!items) {
            throw new BadRequestException('포스트가 존재하지 않습니다.');
        }

        items.entities = items.entities.map((e) => {
            return plainToClass(Post, e);
        });

        return items;
    }

    async findAllByUserId(
        pageNumber: number,
        userId: number,
    ): Promise<Paginatable<Post> | undefined> {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select('post.id', 'id')
            .addSelect('post.title', 'title')
            .addSelect('post.uploadDate', 'uploadDate')
            .addSelect('post.isPrivate', 'isPrivate')
            .leftJoinAndSelect('post.category', 'category')
            .where('post.deletedAt IS NULL')
            .andWhere('post.userId = :userId', { userId });

        return await this.paginationProvider.execute(
            qb,
            pageNumber,
            PaginationConfig.limit.numberPerPage,
            PaginationGetStrategy.GET_MANY,
            PaginationStrategy.SKIP,
        );
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
        const IS_PRIVATE = 0;

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
                searchQuery: `${searchQuery}%`,
            });
        }

        qb.andWhere('post.isPrivate = :isPrivate', { isPrivate: IS_PRIVATE });

        qb.orderBy('post.uploadDate', 'DESC');

        const items = await this.paginationProvider.execute(qb, pageNumber);

        if (!items) {
            throw new BadRequestException('포스트가 존재하지 않습니다.');
        }

        items.entities = items.entities.map((e) => {
            e.content = e.isPrivate
                ? '비공개 글입니다'
                : e.content.slice(0, 30);
            return plainToClass(Post, e);
        });

        return items;
    }
}
