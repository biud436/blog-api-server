import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostTempDto } from './dto/create-post-temp.dto';
import { UpdatePostTempDto } from './dto/update-post-temp.dto';
import { PostTemp } from './entities/post-temp.entity';

@Injectable()
export class PostTempService {
    constructor(
        @InjectRepository(PostTemp)
        private postTempRepository: Repository<PostTemp>,
    ) {}

    async create(createPostTempDto: CreatePostTempDto) {
        return await this.postTempRepository.save(createPostTempDto);
    }
}
