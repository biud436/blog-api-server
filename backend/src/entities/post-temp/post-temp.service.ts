import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreatePostTempDto } from './dto/create-post-temp.dto';
import { PostTempListItem } from './dto/post-temp-list-item.dto';
import { UpdatePostTempDto } from './dto/update-post-temp.dto';
import { PostTemp } from './entities/post-temp.entity';

@Injectable()
export class PostTempService {
    constructor(
        @InjectRepository(PostTemp)
        private postTempRepository: Repository<PostTemp>,
    ) {}

    async create(userId: number, createPostTempDto: CreatePostTempDto) {
        const model = await this.postTempRepository.create(createPostTempDto);
        model.userId = userId;

        return await this.postTempRepository.save(model);
    }

    async findAll(userId: number): Promise<PostTempListItem[]> {
        const LIMIT = 20;

        const qb = this.postTempRepository
            .createQueryBuilder('postTemp')
            .select('postTemp.id')
            .addSelect('postTemp.title')
            .addSelect('postTemp.createdAt')
            .offset(0)
            .limit(LIMIT)
            .where('postTemp.userId = :userId', { userId: userId })
            .orderBy('postTemp.id', 'DESC');

        const items = await qb.getMany();
        const exposedItems = items.map((e) => {
            return plainToInstance(PostTempListItem, e);
        });

        return exposedItems;
    }

    async findOne(userId: number, postId: number): Promise<PostTemp> {
        const qb = this.postTempRepository
            .createQueryBuilder('postTemp')
            .select()
            .where('postTemp.id = :id', {
                id: postId,
            })
            .andWhere('postTemp.userId = :userId', {
                userId,
            });

        const item = await qb.getOne();

        return item;
    }

    async deleteById(userId: number, postId: number): Promise<DeleteResult> {
        const deleteResult = this.postTempRepository
            .createQueryBuilder()
            .delete()
            .from(PostTemp)
            .where(`id = :id`, {
                id: postId,
            })
            .andWhere(`userId = :userId`, {
                userId,
            })
            .execute();

        return deleteResult;
    }

    //#region deleteOldPostTemp
    // async deleteOldPostTemp(userId: number) {
    //     const LIMIT = 20;

    //     const items = await this.postTempRepository
    //         .createQueryBuilder('postTemp')
    //         .select('postTemp.id')
    //         .where(`postTemp.userId = :userId`, {
    //             userId,
    //         })
    //         .orderBy(`postTemp.id`, 'DESC')
    //         .offset(LIMIT)
    //         .getRawMany();

    //     const ids = items.map((e) => e.id);

    //     const deleteResult = await this.postTempRepository
    //         .createQueryBuilder()
    //         .delete()
    //         .from(PostTemp)
    //         .where(`userId = :userId`, {
    //             userId,
    //         })
    //         .andWhere(`id NOT IN (:...ids)`, {
    //             ids,
    //         })
    //         .execute();

    //     return deleteResult;
    // }
    //#endregion

    async updateById(
        updatePostTempDto: UpdatePostTempDto,
        userId: number,
        postId: number,
    ): Promise<UpdateResult> {
        // ! Typeorm에서는 update query에서 table alias와 column alias를 사용할 수 없는 것 같습니다.

        const tableAlias = this.postTempRepository.metadata.tableName;

        const updateResult = await this.postTempRepository
            .createQueryBuilder()
            .update(PostTemp)
            .set({
                ...updatePostTempDto,
            })
            .where(`${tableAlias}.id = :id`, {
                id: postId,
            })
            .andWhere(`${tableAlias}.userId = :userId`, {
                userId,
            })
            .execute();

        return updateResult;
    }
}
