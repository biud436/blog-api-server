import { PaginationConfig } from 'src/common/list-config';
import { VIRTUAL_COLUMN_KEY } from 'src/decorators/virtual-column.decorator';
import { SelectQueryBuilder } from 'typeorm';

declare module 'typeorm' {
    interface SelectQueryBuilder<Entity> {
        getMany(
            this: SelectQueryBuilder<Entity>,
        ): Promise<Entity[] | undefined>;
        getOne(this: SelectQueryBuilder<Entity>): Promise<Entity | undefined>;

        /**
         * 페이지네이션 설정입니다.
         * 조인이 설정된 경우, setPaginationWithJoin를 대신 사용하세요.
         * @param this
         * @param pageNumber
         */
        setPagination(
            this: SelectQueryBuilder<Entity>,
            pageNumber?: number,
        ): SelectQueryBuilder<Entity>;

        /**
         * 페이지네이션 설정입니다.
         * @param this
         * @param pageNumber
         */
        setPaginationWithJoin(
            this: SelectQueryBuilder<Entity>,
            pageNumber?: number,
        ): SelectQueryBuilder<Entity>;
    }
}

SelectQueryBuilder.prototype.getMany = async function () {
    const { entities, raw } = await this.getRawAndEntities();

    const items = entities.map((entitiy, index) => {
        const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
        const item = raw[index];

        for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
            entitiy[propertyKey] = item[name];
        }

        return entitiy;
    });

    return [...items];
};

SelectQueryBuilder.prototype.getOne = async function () {
    const { entities, raw } = await this.getRawAndEntities();
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entities[0]) ?? {};

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
        entities[0][propertyKey] = raw[0][name];
    }

    return entities[0];
};

SelectQueryBuilder.prototype.setPagination = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
) {
    if (this.expressionMap.joinAttributes.length > 0) {
        console.warn(
            '조인이 설정된 경우, setPagination이 제대로 동작하지 않을 수 있습니다. setPaginationWithJoin를 사용해주세요.',
        );
    }
    this.offset(PaginationConfig.limit.pagePerNumber * pageNumber).limit(
        PaginationConfig.limit.pagePerNumber,
    );

    return this;
};

SelectQueryBuilder.prototype.setPaginationWithJoin = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
) {
    this.skip(PaginationConfig.limit.pagePerNumber * pageNumber).take(
        PaginationConfig.limit.pagePerNumber,
    );

    return this;
};
