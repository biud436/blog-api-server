import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { QueryRunner, Repository } from 'typeorm';
import { CreatePostViewCountDto } from './dto/create-post-view-count.dto';

import { PostViewCount } from './entities/post-view-count.entity';

@Injectable()
export class PostViewCountService {
    constructor(
        @InjectRepository(PostViewCount)
        private readonly postViewCountRepository: Repository<PostViewCount>,
    ) {}

    /**
     *
     * @param createPostViewCountDto
     * @param queryRunner
     * @returns
     */
    async create(
        createPostViewCountDto: CreatePostViewCountDto,
        queryRunner?: QueryRunner,
    ): Promise<PostViewCount> {
        const model = await this.postViewCountRepository.create(
            createPostViewCountDto,
        );

        return queryRunner
            ? queryRunner.manager.save(model)
            : this.postViewCountRepository.save(model);
    }

    /**
     *
     * @param id
     * @returns
     */
    async findOne(id: number): Promise<PostViewCount | null> {
        const model = await this.postViewCountRepository
            .createQueryBuilder('post_view_count')
            .select()
            .where('post_view_count.id = :id', { id })
            .andWhere('post_view_count.deletedAt IS NULL')
            .getOne();

        return model;
    }
}
