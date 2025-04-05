import { Image } from '../entities/image.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

export abstract class ImageFindByIdCommand {
  abstract execute(ids: number[]): Promise<Image[]>;
}

@Injectable()
export class ImageFindByIdCommandImpl extends ImageFindByIdCommand {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {
    super();
  }

  async execute(ids: number[]): Promise<Image[]> {
    const qb = this.imageRepository
      .createQueryBuilder('image')
      .select()
      .where('image.id IN (:ids)', { ids });

    return await qb.getMany();
  }
}
