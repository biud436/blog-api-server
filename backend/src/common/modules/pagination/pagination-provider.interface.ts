import { Paginatable } from 'src/common/config/list-config';
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

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
     * Execute query builder with pagination (offset pagination)
     *
     * @param queryBuilder
     * @param pageNumber
     * @param numberPerPage
     */
    execute<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;

    /**
     * Execute query builder with join pagination (offset pagination)
     *
     * @param queryBuilder
     * @param pageNumber
     * @param numberPerPage
     */
    executeWithJoinStrategy<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber?: number,
        numberPerPage?: number,
    ): Promise<Paginatable<Entity>>;
}
