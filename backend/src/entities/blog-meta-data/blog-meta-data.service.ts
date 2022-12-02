import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBlogMetaDatumDto } from './dto/create-blog-meta-datum.dto';
import { UpdateBlogMetaDatumDto } from './dto/update-blog-meta-datum.dto';
import { BlogMetaData } from './entities/blog-meta-data.entity';

@Injectable()
export class BlogMetaDataService {
    constructor(
        @InjectRepository(BlogMetaData)
        private readonly blogMetaDataRepository: Repository<BlogMetaData>,
    ) {}

    /**
     * PK로 블로그 메타 데이터를 조회합니다.
     *
     * @param userId
     * @returns
     */
    async findOne(userId: string): Promise<BlogMetaData> {
        return await this.blogMetaDataRepository
            .createQueryBuilder('blogMetaData')
            .select()
            .where('blogMetaData.userId = :userId', { userId: userId })
            .getOneOrFail();
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
