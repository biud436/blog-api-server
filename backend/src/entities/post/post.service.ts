import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
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
}
