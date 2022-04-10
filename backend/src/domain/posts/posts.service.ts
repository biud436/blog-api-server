import { Injectable } from '@nestjs/common';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';

@Injectable()
export class PostsService {
  constructor(private readonly postService: PostService) {}

  async create(createPostDto: CreatePostDto) {
    return await this.postService.create(createPostDto);
  }

  async findAll(offset: number, limit: number) {
    return await this.postService.findAll(offset, limit);
  }

  async findOne(id: number) {}

  async update(id: number, updatePostDto: UpdatePostDto) {}

  async remove(id: number) {}
}
