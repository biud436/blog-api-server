import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/entities/user/user.service';
import { RedisService } from 'src/micro-services/redis/redis.service';
import { CryptoUtil } from 'src/libs/crypto/CryptoUtil';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from './entities/image.entity';
import { MulterS3File } from '../../interceptors/s3.upload.interceptor';
import { S3ImageUploadDto } from './dto/s3-image-upload.dto';
import { S3Service } from 'src/micro-services/s3/s3.service';
import { ImageCreateCommand } from './commands/image-create.command';
import { ImageTempFileGetterCommand } from './commands/image-temp.command';
import { ImageFindByIdCommand } from './commands/image-find-by-id.command';
import { ImageUpdatePostIdCommand } from './commands/image-update-post-id.command';
import { ImageUploadCommand } from './commands/image-upload.command';
import { ImageDeleteCommand } from './commands/image-delete.command';

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);

    constructor(
        private readonly createCommand: ImageCreateCommand,
        private readonly tempFileGetterCommand: ImageTempFileGetterCommand,
        private readonly findByIdsCommand: ImageFindByIdCommand,
        private readonly updatePostIdCommand: ImageUpdatePostIdCommand,
        private readonly uploadCommand: ImageUploadCommand,
        private readonly deleteCommand: ImageDeleteCommand,
    ) {}

    async create(createImageDto: CreateImageDto, queryRunner?: QueryRunner) {
        return this.createCommand.execute(createImageDto, queryRunner);
    }

    async getTempImageFileName(filename: string, username: string) {
        return this.tempFileGetterCommand.execute(filename, username);
    }

    async findByIds(ids: number[]) {
        return this.findByIdsCommand.execute(ids);
    }

    async updatePostId(
        postId: number,
        imageIds: number[],
        queuryRunner: QueryRunner,
    ) {
        return this.updatePostIdCommand.execute(postId, imageIds, queuryRunner);
    }

    async deleteByIds(ids: number[], queuryRunner: QueryRunner) {
        return this.deleteCommand.execute(ids, queuryRunner);
    }

    async upload(userId: number, files: MulterS3File[], dto: S3ImageUploadDto) {
        return this.uploadCommand.execute(userId, files, dto);
    }
}
