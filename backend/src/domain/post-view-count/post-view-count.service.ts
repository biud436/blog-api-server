import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { CreatePostViewCountDto } from './dto/create-post-view-count.dto';
import { PostViewCount } from './post-view-count.entity';

@Injectable()
export class PostViewCountService {
  constructor(
    @InjectRepository(PostViewCount)
    private readonly postViewCountRepository: BaseRepository<PostViewCount>,
  ) {}

  async create(
    createPostViewCountDto: CreatePostViewCountDto,
  ): Promise<PostViewCount> {
    return await this.postViewCountRepository.save(createPostViewCountDto);
  }

  async findOne(id: number): Promise<PostViewCount | null> {
    return await this.postViewCountRepository.findOne({ where: { id } });
  }
}
