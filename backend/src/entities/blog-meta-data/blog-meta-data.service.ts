import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogMetaData } from './entities/blog-meta-data.entity';

@Injectable()
export class BlogMetaDataService {
    constructor(
        @InjectRepository(BlogMetaData)
        private readonly blogMetaDataRepository: Repository<BlogMetaData>,
    ) {}

    async findOne(userId: number): Promise<BlogMetaData> {
        return await this.blogMetaDataRepository.findOneOrFail({
            where: {
                userId: userId,
            },
        });
    }

    /**
     * 유저명으로 블로그 메타 데이터를 조회합니다.
     *
     * @param username
     * @returns
     */
    async findOneByUsername(username: string): Promise<BlogMetaData> {
        return await this.blogMetaDataRepository
            .createQueryBuilder('blogMetaData')
            .select()
            .leftJoinAndSelect('blogMetaData.user', 'user')
            .where('user.username = :username', { username: username })
            .getOneOrFail();
    }
}
