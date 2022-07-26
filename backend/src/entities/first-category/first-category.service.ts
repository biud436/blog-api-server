import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityBuilder } from 'src/common/entity-builder';
import { FirstCategory } from './entities/first-category.entity';
import { FirstCategoryRepository } from './entities/first-category.repository';

@Injectable()
export class FirstCategoryService {
    constructor(
        @InjectRepository(FirstCategory)
        private readonly firstCategoryRepository: FirstCategoryRepository,
    ) {}

    async findPKByCategoryName(name: string): Promise<number> {
        try {
            const model = await this.firstCategoryRepository
                .createQueryBuilder('first_category')
                .select()
                .where('first_category.name = :name', { name })
                .getOneOrFail();

            const { id } = EntityBuilder.of(FirstCategory, model);

            return id;
        } catch {
            return 0;
        }
    }
}
