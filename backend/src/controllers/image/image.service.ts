import { Injectable } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { CreateImageDto } from './dto/create-image.dto';
import { MulterS3File } from '../../common/interceptors/s3.upload.interceptor';
import { S3ImageUploadDto } from './dto/s3-image-upload.dto';
import { ImageCreateCommandImpl } from './commands/image-create.command';
import { ImageTempFileGetterCommandImpl } from './commands/image-temp.command';
import { ImageFindByIdCommandImpl } from './commands/image-find-by-id.command';
import { ImageUpdatePostIdCommandImpl } from './commands/image-update-post-id.command';
import { ImageUploadCommandImpl } from './commands/image-upload.command';
import { ImageDeleteCommandImpl } from './commands/image-delete.command';

@Injectable()
export class ImageService {
  constructor(
    private readonly createCommand: ImageCreateCommandImpl,
    private readonly tempFileGetterCommand: ImageTempFileGetterCommandImpl,
    private readonly findByIdsCommand: ImageFindByIdCommandImpl,
    private readonly updatePostIdCommand: ImageUpdatePostIdCommandImpl,
    private readonly uploadCommand: ImageUploadCommandImpl,
    private readonly deleteCommand: ImageDeleteCommandImpl,
  ) {}

  async create(createImageDto: CreateImageDto) {
    return this.createCommand.execute(createImageDto);
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

  async deleteByIds(ids: number[]) {
    return this.deleteCommand.execute(ids);
  }

  async upload(userId: number, files: MulterS3File[], dto: S3ImageUploadDto) {
    return this.uploadCommand.execute(userId, files, dto);
  }
}
