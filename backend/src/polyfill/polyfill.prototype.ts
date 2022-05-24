import {
    PaginationConfig,
    PaginationFlushObject as PaginationFlags,
} from 'src/common/list-config';
import { VIRTUAL_COLUMN_KEY } from 'src/decorators/virtual-column.decorator';
import { SelectQueryBuilder } from 'typeorm';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';
// import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

declare module 'typeorm' {
    interface SelectQueryBuilder<Entity> {
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

        getManyWithPagination(
            this: SelectQueryBuilder<Entity>,
            pageNumber: number,
        ): Promise<
            PaginationFlags & {
                entities: Entity[];
            }
        >;
    }
}

SelectQueryBuilder.prototype.setPagination = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
) {
    this.offset(PaginationConfig.limit.numberPerPage * pageNumber).limit(
        PaginationConfig.limit.numberPerPage,
    );

    return this;
};

SelectQueryBuilder.prototype.setPaginationWithJoin = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
) {
    this.skip(PaginationConfig.limit.numberPerPage * pageNumber).take(
        PaginationConfig.limit.numberPerPage,
    );

    return this;
};

SelectQueryBuilder.prototype.getManyWithPagination = async function (
    pageNumber: number,
) {
    const qb = this.clone();

    const totalRecord = await qb.getCount();
    const totalPage = Math.ceil(
        totalRecord / PaginationConfig.limit.numberPerPage,
    );
    const currentPage = pageNumber;
    const currentBlock = Math.ceil(
        currentPage / PaginationConfig.limit.pagePerBlock,
    );
    const totalBlock = Math.ceil(
        totalPage / PaginationConfig.limit.pagePerBlock,
    );

    const entities = await qb.getMany();

    return {
        entities,
        totalRecord,
        currentPage,
        maxPage: totalPage,
        currentBlock,
        totalBlock,
    };
};
