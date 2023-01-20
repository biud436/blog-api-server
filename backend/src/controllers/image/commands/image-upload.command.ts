import { MulterS3File } from 'src/interceptors/s3.upload.interceptor';
import { S3ImageUploadDto } from '../dto/s3-image-upload.dto';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/micro-services/redis/redis.service';
import { CreateImageDto } from '../dto/create-image.dto';
import { ImageCreateCommand } from './image-create.command';

export abstract class ImageUploadCommand {
    abstract execute(
        userId: number,
        files: MulterS3File[],
        { postId }: S3ImageUploadDto,
    ): Promise<any>;
}

@Injectable()
export class ImageUploadCommandImpl extends ImageUploadCommand {
    private readonly logger = new Logger(ImageUploadCommand.name);

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly redisService: RedisService,
        private readonly createCommand: ImageCreateCommand,
    ) {
        super();
    }

    async execute(
        userId: number,
        files: MulterS3File[],
        { postId }: S3ImageUploadDto,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const file of files) {
                const key = file.key.split('.')[0];

                const dto = <CreateImageDto>{
                    filename: key,
                    originalname: file.originalname,
                    destination: file.location,
                    size: file.size,
                    mimetype: file.mimetype,
                    encoding: file['encoding'],
                    fieldname: file.fieldname,
                    path: file.location,
                    postId, // 특정 포스트와 연결
                };

                const result = await this.createCommand.execute(
                    dto,
                    queryRunner,
                );
                if (result) {
                    this.logger.log(
                        `-- ${file.originalname} 이미지 업로드 완료 --`,
                    );
                }

                await this.redisService.saveTemporarilyImageIds(
                    userId + '',
                    result.id + '',
                );
            }

            await queryRunner.commitTransaction();

            return files[0];
        } catch (e) {
            this.logger.error(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
