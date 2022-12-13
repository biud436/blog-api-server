import { BadRequestException } from '@nestjs/common';
import {
    PaginationConfig,
    PaginationFlushObject as PaginationFlags,
    PaginationResult,
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
            | {
                  pagination: PaginationResult;
                  entities: Entity[];
              }
            | undefined
        >;

        getRawManyWithPagination(
            this: SelectQueryBuilder<Entity>,
            pageNumber: number,
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
) {
    this.offset(PaginationConfig.limit.numberPerPage * (pageNumber - 1)).limit(
        PaginationConfig.limit.numberPerPage,
    );

    return this;
};

SelectQueryBuilder.prototype.setPaginationWithJoin = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
) {
    this.skip(PaginationConfig.limit.numberPerPage * (pageNumber - 1)).take(
        PaginationConfig.limit.numberPerPage,
    );

    return this;
};

SelectQueryBuilder.prototype.getManyWithPagination = async function (
    pageNumber: number,
) {
    const cloneQueryBuilder = this.clone();
    const totalCount = await cloneQueryBuilder.getCount();
    const maxPage = Math.ceil(
        totalCount / PaginationConfig.limit.numberPerPage,
    );

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
) {
    const cloneQueryBuilder = this.clone();

    const totalCount = await this.getCount();
    const entities = await cloneQueryBuilder.getRawMany();
    const maxPage = Math.ceil(
        totalCount / PaginationConfig.limit.numberPerPage,
    );

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
