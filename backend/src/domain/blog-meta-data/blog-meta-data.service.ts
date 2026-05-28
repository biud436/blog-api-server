import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@stingerloom/orm';
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
    return await this.blogMetaDataRepository
      .createQueryBuilder('blogMetaData')
      .leftJoinAndSelect(User, 'user', (j) =>
        j.on('blogMetaData.user_id', '=', 'user.id'),
      )
      .where('user.username', username)
      .getOneOrFail();
  }
}
