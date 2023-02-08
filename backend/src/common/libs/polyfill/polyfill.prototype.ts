import { BadRequestException } from '@nestjs/common';
import {
    PaginationConfig,
    PaginationFlushObject as PaginationFlags,
    PaginationResult,
} from 'src/common/list-config';
import { VIRTUAL_COLUMN_KEY } from 'src/common/decorators/virtual-column.decorator';
import { SelectQueryBuilder } from 'typeorm';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';
// import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

declare module 'typeorm' {
    interface SelectQueryBuilder<Entity> {
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

SelectQueryBuilder.prototype.setPagination = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
    numberPerPage?: number,
) {
    numberPerPage ??= PaginationConfig.limit.numberPerPage;

    this.offset(numberPerPage * (pageNumber - 1)).limit(numberPerPage);

    return this;
};

SelectQueryBuilder.prototype.setPaginationWithJoin = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
    numberPerPage?: number,
) {
    numberPerPage ??= PaginationConfig.limit.numberPerPage;

    this.skip(numberPerPage * (pageNumber - 1)).take(numberPerPage);

    return this;
};

SelectQueryBuilder.prototype.getManyWithPagination = async function (
    pageNumber: number,
    numberPerPage?: number,
) {
    numberPerPage ??= PaginationConfig.limit.numberPerPage;

    const cloneQueryBuilder = this.clone();
    const totalCount = await cloneQueryBuilder.getCount();
    const maxPage = Math.ceil(totalCount / numberPerPage);

    const maxBlock = Math.ceil(maxPage / PaginationConfig.limit.pagePerBlock);
    const currentBlock = Math.ceil(
        pageNumber / PaginationConfig.limit.pagePerBlock,
    );

    if (pageNumber > maxPage) {
        throw new BadRequestException('조회할 페이지가 존재하지 않습니다.');
    }

    const result = <PaginationResult>{
        currentPage: pageNumber,
        totalCount,
        maxPage,
        currentBlock,
        maxBlock,
    };
    const entities = await cloneQueryBuilder.getMany();

    return {
        pagination: result,
        entities,
    };
};

SelectQueryBuilder.prototype.getRawManyWithPagination = async function (
    pageNumber: number,
    numberPerPage?: number,
) {
    numberPerPage ??= PaginationConfig.limit.numberPerPage;

    const cloneQueryBuilder = this.clone();

    const totalCount = await this.getCount();
    const entities = await cloneQueryBuilder.getRawMany();
    const maxPage = Math.ceil(totalCount / numberPerPage);

    const maxBlock = Math.ceil(maxPage / PaginationConfig.limit.pagePerBlock);
    const currentBlock = Math.ceil(
        pageNumber / PaginationConfig.limit.pagePerBlock,
    );

    if (pageNumber > maxPage) {
        throw new BadRequestException('조회할 페이지가 존재하지 않습니다.');
    }

    const result = <PaginationResult>{
        currentPage: pageNumber,
        totalCount,
        maxPage,
        currentBlock,
        maxBlock,
    };

    return {
        pagination: result,
        entities,
    };
};
