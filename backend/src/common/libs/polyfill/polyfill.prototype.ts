import { BadRequestException } from '@nestjs/common';
import {
    PaginationConfig,
    PaginationFlushObject as PaginationFlags,
    PaginationResult,
} from 'src/common/list-config';
import { VIRTUAL_COLUMN_KEY } from 'src/common/decorators/virtual-column.decorator';
import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

import { SelectQueryBuilder } from 'typeorm';
// import { QueryExpressionMap } from 'typeorm/query-builder/QueryExpressionMap';

SelectQueryBuilder.prototype.setPagination = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
    numberPerPage?: number,
) {
    numberPerPage ??= PaginationConfig.limit.numberPerPage;

    if (!pageNumber) {
        pageNumber = 1;
    }

    if (pageNumber < 1) {
        pageNumber = 1;
    }

    this.offset(numberPerPage * (pageNumber - 1)).limit(numberPerPage);

    return this;
};

SelectQueryBuilder.prototype.setPaginationWithJoin = function (
    this: SelectQueryBuilder<any>,
    pageNumber?: number,
    numberPerPage?: number,
) {
    numberPerPage ??= PaginationConfig.limit.numberPerPage;

    if (!pageNumber) {
        pageNumber = 1;
    }

    if (pageNumber < 1) {
        pageNumber = 1;
    }

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

    if (pageNumber < 1) {
        pageNumber = 1;
    }

    const maxBlock = Math.ceil(maxPage / PaginationConfig.limit.pagePerBlock);
    const currentBlock = Math.ceil(
        pageNumber / PaginationConfig.limit.pagePerBlock,
    );

    if (pageNumber > maxPage) {
        pageNumber = maxPage;

        if (cloneQueryBuilder.expressionMap.offset !== undefined) {
            cloneQueryBuilder.setPagination(pageNumber, numberPerPage);
        } else if (cloneQueryBuilder.expressionMap.skip !== undefined) {
            cloneQueryBuilder.setPaginationWithJoin(pageNumber, numberPerPage);
        }
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
    const maxPage = Math.ceil(totalCount / numberPerPage);
    if (pageNumber < 1) {
        pageNumber = 1;
    }

    if (pageNumber > maxPage) {
        pageNumber = maxPage;

        if (cloneQueryBuilder.expressionMap.offset !== undefined) {
            cloneQueryBuilder.setPagination(pageNumber, numberPerPage);
        } else if (cloneQueryBuilder.expressionMap.skip !== undefined) {
            cloneQueryBuilder.setPaginationWithJoin(pageNumber, numberPerPage);
        }
    }

    const maxBlock = Math.ceil(maxPage / PaginationConfig.limit.pagePerBlock);
    const currentBlock = Math.ceil(
        pageNumber / PaginationConfig.limit.pagePerBlock,
    );

    const entities = await cloneQueryBuilder.getRawMany();

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
