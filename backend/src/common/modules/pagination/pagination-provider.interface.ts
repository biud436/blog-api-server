import { Paginatable } from 'src/common/config/list-config';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import {
    PaginationGetStrategy,
    PaginationStrategy,
} from './pagination.constant';

export interface IPaginationProvider {
    /**
     * Set pagination for query builder (offset pagination)
     *
     * @param queryBuilder
     * @param pageNumber
     * @param numberPerPage
     */
    setPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): this;

    /**
     * Set pagination for query builder with join (offset pagination)
     * @param queryBuilder
     * @param pageNumber
     * @param numberPerPage
     */
    setPaginationWithJoin<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): this;

    /**
     * Get many with pagination (offset pagination)
     *
     * @param queryBuilder
     * @param pageNumber
     * @param numberPerPage
     */
    getManyWithPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;

    /**
     * Get raw many with pagination (offset pagination)
     * @param queryBuilder
     * @param pageNumber
     * @param numberPerPage
     */
    getRawManyWithPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;

    /**
     * 페이지네이션을 실행합니다.
     *
     * @param qb
     * @param pageNumber
     * @param numberPerPage
     * @param getStrategy
     */
    execute<Entity extends ObjectLiteral>(
        qb: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number | undefined,
        getStrategy?: PaginationGetStrategy,
        offsetStrategy?: PaginationStrategy,
    ): Promise<Paginatable<Entity>>;
}
