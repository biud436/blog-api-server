import { SelectQueryBuilder } from 'typeorm';

declare module 'typeorm' {
    interface SelectQueryBuilder<Entity> extends QueryBuilder<Entity> {
        /**
         * 페이지네이션 설정입니다.
         * 조인이 설정된 경우, setPaginationWithJoin를 대신 사용하세요.
         *
         * @param this
         * @param pageNumber 페이지 번호
         * @param numberPerPage 페이지당 표시할 레코드 개수
         */
        setPagination(
            this: SelectQueryBuilder<Entity>,
            pageNumber?: number,
            numberPerPage?: number,
        ): SelectQueryBuilder<Entity>;

        /**
         * 페이지네이션 설정입니다.
         *
         * @param this
         * @param pageNumber
         * @param numberPerPage
         */
        setPaginationWithJoin(
            this: SelectQueryBuilder<Entity>,
            pageNumber?: number,
            numberPerPage?: number,
        ): SelectQueryBuilder<Entity>;

        /**
         * 페이지네이션이 설정된 쿼리를 실행합니다 (쿼리 파서 -> 결과 -> 엔티티에 바인딩 -> JSON)
         *
         * @param this
         * @param pageNumber 페이지 번호
         * @param numberPerPage 페이지당 표시할 레코드 개수
         */
        getManyWithPagination(
            this: SelectQueryBuilder<Entity>,
            pageNumber: number,
            numberPerPage?: number,
        ): Promise<
            | {
                  pagination: PaginationResult;
                  entities: Entity[];
              }
            | undefined
        >;

        /**
         * 페이지네이션이 설정된 쿼리를 실행합니다 (쿼리 파서 -> 결과 -> JSON)
         *
         * @param this
         * @param pageNumber 페이지 번호
         * @param numberPerPage 페이지당 표시할 레코드 개수
         */
        getRawManyWithPagination(
            this: SelectQueryBuilder<Entity>,
            pageNumber: number,
            numberPerPage?: number,
        ): Promise<
            | {
                  pagination: PaginationResult;
                  entities: Entity[];
              }
            | undefined
        >;
    }
}
