import { DeleteResult, QueryRunner, Repository } from 'typeorm';
import { Image } from '../entities/image.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    ImageFindByIdCommand,
    ImageFindByIdCommandImpl,
} from './image-find-by-id.command';
import { S3Service } from 'src/common/micro-services/s3/s3.service';

export abstract class ImageDeleteCommand {
    abstract execute(
        ids: number[],
        queuryRunner: QueryRunner,
    ): Promise<DeleteResult>;
}

@Injectable()
export class ImageDeleteCommandImpl extends ImageDeleteCommand {
    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        private readonly findByIdsCommand: ImageFindByIdCommandImpl,
        private readonly s3Service: S3Service,
    ) {
        super();
    }

    async execute(ids: number[]): Promise<DeleteResult> {
        const images = await this.findByIdsCommand.execute(ids);

        if (!images) {
            throw new BadRequestException('해당 이미지는 존재하지 않습니다.');
        }

        await this.s3Service.deleteFile(images);

        const qb = this.imageRepository
            .createQueryBuilder('image')
            .delete()
            .where('image.id IN (:ids)', { ids });

        return await qb.execute();
    }
}
