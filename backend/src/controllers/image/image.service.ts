import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { ImageRepository } from './entities/image.repository';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(ImageRepository)
    private readonly imageRepository: ImageRepository,
  ) {}

  async create(createImageDto: CreateImageDto, queryRunner?: QueryRunner) {
    const model = this.imageRepository.create(createImageDto);

    if (queryRunner) {
      return queryRunner.manager.save(model);
    }

    return this.imageRepository.save(model);
  }
}
