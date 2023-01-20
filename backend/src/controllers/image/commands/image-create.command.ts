import { QueryRunner, Repository } from 'typeorm';
import { CreateImageDto } from '../dto/create-image.dto';
import { Image } from '../entities/image.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export abstract class ImageCreateCommand {
    abstract execute(
        createImageDto: CreateImageDto,
        queryRunner?: QueryRunner,
    ): Promise<Image>;
}

@Injectable()
export class ImageCreateCommandImpl extends ImageCreateCommand {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
    ) {
        super();
    }

    async execute(
        createImageDto: CreateImageDto,
        queryRunner?: QueryRunner,
    ): Promise<Image> {
        const model = this.imageRepository.create(createImageDto);

        if (queryRunner) {
            return queryRunner.manager.save(model);
        }

        return this.imageRepository.save(model);
    }
}
