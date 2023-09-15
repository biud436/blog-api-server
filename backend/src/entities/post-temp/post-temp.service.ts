import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { classToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { PaginableWithCount } from 'src/common/config/list-config';
import { CRC32 } from 'src/common/libs/crypto/CrcUtil';
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

    /**
     * 임시 포스트를 신규 작성한다.
     *
     * ? 1. 수정 시, 임시 포스트 생성
     * 임시 포스트는 항상 신규 작성되지만
     * 포스트를 수정할 때, 기존의 임시 포스트가 존재한다면 덮어쓰기를 해야 한다.
     * 따라서 Post와 연관 관계가 형성되어야 한다.
     * 이때, postId는 null이 될 수도 있다.
     *
     * ? 2. 새로 작성 시, 임시 포스트 생성
     * 새로 작성할 때, 임시 포스트를 생성한다.
     *
     * ? 3. 주기적으로 임시 포스트를 업데이트
     * 임시 포스트는 주기적으로 업데이트되어야 한다.
     *
     * ? 4. 임시 포스트 삭제
     * 임시 포스트는 글이 작성되거나 수정되면 삭제되어야 한다.
     *
     * @param userId
     * @param createPostTempDto
     * @returns
     */
    async create(userId: number, createPostTempDto: CreatePostTempDto) {
        const model = await this.postTempRepository.create(createPostTempDto);
        model.userId = userId;

        const savedModel = await this.postTempRepository.save(model);

        savedModel.checksum = CRC32.getChecksum(
            savedModel.createdAt.toString() + savedModel.title,
        );

        return await this.postTempRepository.save(savedModel);
    }

    async needsToUpdate(userId: number, postId: number): Promise<boolean> {
        const postTemp = await this.postTempRepository.findOneOrFail({
            where: {
                id: postId,
                userId: userId,
            },
        });

        const checksum = CRC32.getChecksum(
            postTemp.createdAt.toString() + postTemp.title,
        );

        return postTemp.checksum !== checksum;
    }

    async findAll(
        userId: number,
    ): Promise<PaginableWithCount<PostTempListItem>> {
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

        const [items, count] = await qb.getManyAndCount();
        const exposedItems = items.map((e) => {
            return plainToInstance(PostTempListItem, e);
        });

        return <PaginableWithCount<PostTempListItem>>{
            entities: exposedItems,
            count,
        };
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

        const item = await qb.getOneOrFail();

        return item;
    }

    async deleteById(userId: number, postId: number): Promise<DeleteResult> {
        const deleteResult = await this.postTempRepository
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
