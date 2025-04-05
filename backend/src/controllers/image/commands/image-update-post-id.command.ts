import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from '../entities/image.entity';

export abstract class ImageUpdatePostIdCommand {
  abstract execute(
    postId: number,
    imageIds: number[],
    queuryRunner: QueryRunner,
  ): Promise<UpdateResult>;
}

@Injectable()
export class ImageUpdatePostIdCommandImpl extends ImageUpdatePostIdCommand {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {
    super();
  }

  async execute(postId: number, imageIds: number[], queuryRunner: QueryRunner) {
    const qb = this.imageRepository
      .createQueryBuilder('image')
      .setQueryRunner(queuryRunner)
      .update()
      .set({ postId })
      .where('image.id IN (:imageIds)', { imageIds });

    return await qb.execute();
  }
}
