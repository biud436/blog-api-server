import { Injectable } from '@nestjs/common';
import { BaseRepository, qAlias } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { User } from '../user/user.entity';
import { BlogMetaData } from './blog-meta-data.entity';

@Injectable()
export class BlogMetaDataService {
  constructor(
    @InjectRepository(BlogMetaData)
    private readonly blogMetaDataRepository: BaseRepository<BlogMetaData>,
  ) {}

  async findOne(userId: number): Promise<BlogMetaData> {
    return await this.blogMetaDataRepository.findOneOrFail({
      where: { userId },
    });
  }

  async findOneByUsername(username: string): Promise<BlogMetaData> {
    const blogMetaData = qAlias(BlogMetaData, 'blogMetaData');
    const user = qAlias(User, 'user');

    // 조인은 WHERE 필터 용도로만 사용한다 — joinAndSelect 는 중복 컬럼명이
    // 루트 엔티티를 덮어쓰는 업스트림 이슈가 있다 (SELECT 는 root.* 만).
    return await this.blogMetaDataRepository
      .createQueryBuilder('blogMetaData')
      .leftJoin(User, 'user', (j) =>
        j.on(blogMetaData.col('userId'), '=', user.col('id')),
      )
      .where(user.username.eq(username))
      .getOneOrFail();
  }
}
