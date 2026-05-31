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

    return await this.blogMetaDataRepository
      .createQueryBuilder('blogMetaData')
      .leftJoinAndSelect(User, 'user', (j) =>
        j.on(blogMetaData.col('userId'), '=', user.col('id')),
      )
      .where(user.username.eq(username))
      .getOneOrFail();
  }
}
