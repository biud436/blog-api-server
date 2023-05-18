import { MulterS3File } from 'src/common/interceptors/s3.upload.interceptor';
import { S3ImageUploadDto } from '../dto/s3-image-upload.dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
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

    /**
     * 키 값에서 파일명을 추출합니다.
     *
     * @param key
     * @returns
     */
    extractFilenameFromKey(key: string) {
        if (!key.includes('.')) {
            return key;
        }
        return key.split('.')[0];
    }

    /**
     * CreateImageDto를 생성합니다.
     *
     * @param postId
     * @param key
     * @param file
     * @returns
     */
    getValidDto(postId: number, key: string, file: MulterS3File) {
        return <CreateImageDto>{
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
    }

    /**
     * 20분간 유효한 이미지 아이디 (키)를 레디스에 저장합니다.
     *
     * @param userId
     * @param imageId
     */
    async saveTemporarilyImageIds(userId: number, imageId: number) {
        await this.redisService.saveTemporarilyImageIds(
            userId.toString(),
            imageId.toString(),
        );
    }

    async execute(
        userId: number,
        files: MulterS3File[],
        { postId }: S3ImageUploadDto,
    ) {
        if (!postId) {
            throw new BadRequestException('포스트 아이디가 존재하지 않습니다.');
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const file of files) {
                const key = this.extractFilenameFromKey(file.key);
                const dto = this.getValidDto(postId, key, file);

                const result = await this.createCommand.execute(
                    dto,
                    queryRunner,
                );
                if (result) {
                    this.logger.log(
                        `-- ${file.originalname} has completed uploading.`,
                    );
                }

                await this.saveTemporarilyImageIds(userId, result.id);
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
