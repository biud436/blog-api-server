import { Paginatable } from 'src/common/config/list-config';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export interface IPaginationProvider {
    setPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): this;

    setPaginationWithJoin<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): this;

    getManyWithPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;

    getRawManyWithPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;

    execute<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;
}
