import { MulterS3File } from 'src/common/interceptors/s3.upload.interceptor';
import { S3ImageUploadDto } from '../dto/s3-image-upload.dto';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { CreateImageDto } from '../dto/create-image.dto';
import {
  ImageCreateCommand,
  ImageCreateCommandImpl,
} from './image-create.command';
import { Transactional } from 'typeorm-transactional';

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
    private readonly redisService: RedisService,
    private readonly createCommand: ImageCreateCommandImpl,
  ) {
    super();
  }

  /**
   * 키 값에서 파일명을 추출합니다.
   *
   * @param key
   * @returns
   */
  private extractFilenameFromKey(key: string) {
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
  private getValidDto(
    postId: number | null | undefined,
    key: string,
    file: MulterS3File,
  ) {
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
  private async saveTemporarilyImageIds(userId: number, imageId: number) {
    await this.redisService.saveTemporarilyImageIds(
      userId.toString(),
      imageId.toString(),
    );
  }

  @Transactional()
  async execute(
    userId: number,
    files: MulterS3File[],
    { postId }: S3ImageUploadDto,
  ) {
    try {
      for (const file of files) {
        const key = this.extractFilenameFromKey(file.key);
        const dto = this.getValidDto(postId, key, file);

        const result = await this.createCommand.execute(dto);
        if (result) {
          this.logger.log(`-- ${file.originalname} has completed uploading.`);
        }

        await this.saveTemporarilyImageIds(userId, result.id);
      }

      return files[0];
    } catch (e) {
      this.logger.error(e);
    }
  }
}
