import { Logger } from '@nestjs/common';
import { FirstCategory } from 'src/entities/first-category/entities/first-category.entity';
import { SecondCategory } from 'src/entities/second-category/entities/second-category.entity';
import { EntityBuilder } from '../common/entity-builder';
import { Admin } from '../entities/admin/entities/admin.entity';

describe('EntityBuilder', () => {
    const logger = new Logger('EntityBuilder');

    it('Admin', () => {
        const data = EntityBuilder.of(Admin, {
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 1,
        });

        logger.log(JSON.stringify(data));

        expect(data).toBeInstanceOf(Admin);
    });

    it('First Category', () => {
        const secondCategory = EntityBuilder.of(SecondCategory, {
            id: 1,
            description: '타입스크립트',
            name: '타입스크립트',
            posts: [],
        });

        const firstCategory = EntityBuilder.of(FirstCategory, {
            id: 1,
            description: '프로그래밍',
            name: '프로그래밍',
            posts: [],
            secondCategories: [secondCategory],
        });

        logger.log(JSON.stringify(firstCategory));
        logger.log(JSON.stringify(secondCategory));

        expect(firstCategory).toBeInstanceOf(FirstCategory);
        expect(secondCategory).toBeInstanceOf(SecondCategory);
    });
});
