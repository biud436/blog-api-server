import { Logger } from '@nestjs/common';
import { EntityBuilder } from '../common/entity-builder';
import { Admin } from '../entities/admin/entities/admin.entity';

describe('EntityBuilder', () => {
    it('Entity 빌더로 엔티티 생성', () => {
        const logger = new Logger(Admin.name);

        const data = EntityBuilder.of(Admin, {
            id: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: 1,
        });

        logger.log(JSON.stringify(data));

        expect(data).toBeInstanceOf(Admin);
    });
});
