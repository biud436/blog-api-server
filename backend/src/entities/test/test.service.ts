import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { CreatePostDto } from '../post/dto/create-post.dto';
import { PostRepository } from '../post/entities/post.repository';

@Injectable()
export class TestService {
  constructor(
    @InjectRepository(PostRepository)
    private readonly postRepository: PostRepository,
  ) {}

  async create(createPostDto: CreatePostDto) {
    const model = this.postRepository.create(createPostDto);
    model.uploadDate = DateTimeUtil.toDate(DateTimeUtil.now());

    return await this.postRepository.save(model);
  }

  async findAll(offset: number, limit: number) {
    const items = await this.postRepository
      .createQueryBuilder('post')
      .select()
      .where('post.deletedAt IS NULL')
      .orderBy('post.uploadDate', 'DESC')
      .offset(offset)
      .take(limit)
      .getMany();

    return items;
  }
}
