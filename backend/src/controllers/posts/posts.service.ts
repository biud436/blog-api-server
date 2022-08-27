import { Injectable } from '@nestjs/common';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';
import { QueryRunner } from 'typeorm';

@Injectable()
export class PostsService {
    constructor(private readonly postService: PostService) {}

    async create(createPostDto: CreatePostDto, queryRunner: QueryRunner) {
        return await this.postService.create(createPostDto, queryRunner);
    }

    async findAll(page: number, categoryId?: number) {
        return await this.postService.findAll(page, categoryId);
    }

    async findOne(id: number) {
        //
    }

    async update(id: number, updatePostDto: UpdatePostDto) {
        //
    }

    async remove(id: number) {
        //
    }
}
