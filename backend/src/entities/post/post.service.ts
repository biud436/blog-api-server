import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

        if (!model.firstCategoryId) {
            throw new Error('대분류 카테고리를 선택해주세요.');
        }

        if (!model.secondCategoryId) {
            throw new Error('중분류 카테고리를 선택해주세요.');
        }

        if (!model.authorId) {
            throw new Error('작성자가 없습니다.');
        }

        // 조회수 생성
        model.viewCount = new PostViewCount();
        model.viewCount.count = 0;
        model.viewCount.createdAt = now;
        model.viewCount.updatedAt = now;

        return await queuryRunner.manager.save(model);
    }

    async findAll(pageNumber: number) {
        const items = await this.postRepository
            .createQueryBuilder('post')
            .select()
            .where('post.deletedAt IS NULL')
            .orderBy('post.uploadDate', 'DESC')
            .setPagination(pageNumber)
            .getManyWithPagination(pageNumber);

        return items;
    }
}
