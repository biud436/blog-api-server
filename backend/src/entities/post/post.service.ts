import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { encodeHtml } from 'src/common/html-escpse';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { QueryRunner, Repository } from 'typeorm';
import { PostViewCount } from '../post-view-count/entities/post-view-count.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
    constructor(
        @InjectRepository(Post)
        private readonly postRepository: Repository<Post>,
    ) {}

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
            throw new Error('카테고리를 선택해주세요.');
        }

        if (!model.authorId) {
            throw new Error('작성자가 없습니다.');
        }

        const postViewCount = await queuryRunner.manager.save(
            new PostViewCount(),
        );

        model.viewCountId = postViewCount.id;
        model.viewCount = postViewCount;

        return await queuryRunner.manager.save(model);
    }

    async findOne(postId: number) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('post.deletedAt IS NULL')
            .andWhere('post.id = :postId', { postId });

        const item = await qb.getOne();

        return plainToClass(Post, item);
    }

    async findAll(pageNumber: number, categoryId?: number) {
        const qb = this.postRepository
            .createQueryBuilder('post')
            .select()
            .leftJoinAndSelect('post.user', 'user')
            .leftJoinAndSelect('post.category', 'category')
            .leftJoinAndSelect('user.profile', 'profile')
            .leftJoinAndSelect('post.viewCount', 'viewCount')
            .where('post.deletedAt IS NULL');

        if (categoryId) {
            qb.andWhere('post.categoryId = :categoryId', { categoryId });
        }

        qb.orderBy('post.uploadDate', 'DESC');

        const items = await qb
            .setPagination(pageNumber)
            .getManyWithPagination(pageNumber);

        items.entities = items.entities.map((e) => plainToClass(Post, e));

        return items;
    }

    async updateViewCount(postId: number, count: number) {
        const post = await this.postRepository.findOne({
            where: { id: postId },
            relations: ['viewCount'],
        });

        if (!post) {
            throw new Error('존재하지 않는 게시물입니다.');
        }

        post.viewCount.count = count;

        return await this.postRepository.save(post);
    }
}
