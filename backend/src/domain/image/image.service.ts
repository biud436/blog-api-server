import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { BaseRepository, DeleteResult, Transactional } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { CreateImageDto } from '../../controllers/image/dto/create-image.dto';
import { S3ImageUploadDto } from '../../controllers/image/dto/s3-image-upload.dto';
import { MulterS3File } from '../../common/interceptors/s3.upload.interceptor';
import { RedisService } from '../../common/micro-services/redis/redis.service';
import { CryptoUtil } from '../../common/libs/crypto/CryptoUtil';
import { UserService } from '../user/user.service';
import { Image } from './image.entity';

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: BaseRepository<Image>,
    private readonly redisService: RedisService,
    private readonly userService: UserService,
  ) {}

  async create(createImageDto: CreateImageDto): Promise<Image> {
    return await this.imageRepository.save(createImageDto as Partial<Image>);
  }

  async findByIds(ids: number[]): Promise<Image[]> {
    if (ids.length === 0) return [];
    return await this.imageRepository.find({
      where: { id: { in: ids } },
    });
  }

  async updatePostId(
    postId: number,
    imageIds: number[],
  ): Promise<{ affected: number }> {
    if (imageIds.length === 0) return { affected: 0 };
    return await this.imageRepository.updateMany(
      { postId },
      { where: { id: { in: imageIds } } },
    );
  }

  async deleteByIds(ids: number[]): Promise<DeleteResult> {
    if (ids.length === 0) return { affected: 0 };
    return await this.imageRepository.delete({ id: { in: ids } });
  }

  /**
   * S3 업로드 시 사용할 임시 파일명을 생성한다.
   * (기존 TypeORM ImageTempFileGetterCommand 와 동일 로직)
   */
  async getTempImageFileName(
    filename: string,
    username: string,
  ): Promise<string> {
    const user = await this.userService.findProfileByUsername(username);

    if (!user) {
      throw new BadRequestException('해당 유저는 존재하지 않습니다.');
    }

    const hashFile = CryptoUtil.uuid().replace(/-/gi, '');
    const tempFileName = CryptoUtil.sha512(username + hashFile);

    return tempFileName;
  }

  /**
   * 커스텀 S3 인터셉터로 업로드된 파일들을 이미지 레코드로 저장하고,
   * 20분간 유효한 임시 이미지 아이디를 레디스에 적재한다.
   * (기존 TypeORM ImageUploadCommand 와 동일 로직)
   */
  @Transactional()
  async upload(
    userId: number,
    files: MulterS3File[],
    { postId }: S3ImageUploadDto,
  ): Promise<MulterS3File | undefined> {
    try {
      for (const file of files) {
        const key = this.extractFilenameFromKey(file.key);
        const dto = this.getValidDto(postId, key, file);

        const result = await this.create(dto);
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

  private extractFilenameFromKey(key: string): string {
    if (!key.includes('.')) {
      return key;
    }
    return key.split('.')[0];
  }

  private getValidDto(
    postId: number | null | undefined,
    key: string,
    file: MulterS3File,
  ): CreateImageDto {
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

  private async saveTemporarilyImageIds(
    userId: number,
    imageId: number,
  ): Promise<void> {
    await this.redisService.saveTemporarilyImageIds(
      userId.toString(),
      imageId.toString(),
    );
  }
}
