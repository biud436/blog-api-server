import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from './entities/image.entity';

@Injectable()
export class ImageService {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
    ) {}

    async create(createImageDto: CreateImageDto, queryRunner?: QueryRunner) {
        const model = this.imageRepository.create(createImageDto);

        if (queryRunner) {
            return queryRunner.manager.save(model);
        }

        return this.imageRepository.save(model);
    }
}
