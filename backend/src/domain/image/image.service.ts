import { Injectable } from '@nestjs/common';
import { BaseRepository, DeleteResult } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { CreateImageDto } from '../../controllers/image/dto/create-image.dto';
import { Image } from './image.entity';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: BaseRepository<Image>,
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
}
