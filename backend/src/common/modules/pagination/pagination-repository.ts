import { Injectable } from '@nestjs/common';
import { PaginationConfig, PaginationResult } from 'src/common/list-config';
import {
    EntityManager,
    EntityTarget,
    ObjectLiteral,
    QueryRunner,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';

@Injectable()
export class PaginationProvider {
    setPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
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

        queryBuilder
            .offset(numberPerPage * (pageNumber - 1))
            .limit(numberPerPage);

        return this;
    }

    setPaginationWithJoin<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
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

        queryBuilder.skip(numberPerPage * (pageNumber - 1)).take(numberPerPage);

        return this;
    }

    async getManyWithPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number,
    ) {
        numberPerPage ??= PaginationConfig.limit.numberPerPage;

        const cloneQueryBuilder = queryBuilder.clone();
        const totalCount = await cloneQueryBuilder.getCount();
        const maxPage = Math.ceil(totalCount / numberPerPage);

        if (pageNumber < 1) {
            pageNumber = 1;
        }

        const maxBlock = Math.ceil(
            maxPage / PaginationConfig.limit.pagePerBlock,
        );
        const currentBlock = Math.ceil(
            pageNumber / PaginationConfig.limit.pagePerBlock,
        );

        if (pageNumber > maxPage) {
            pageNumber = maxPage;

            if (cloneQueryBuilder.expressionMap.offset !== undefined) {
                this.setPagination(
                    cloneQueryBuilder,
                    pageNumber,
                    numberPerPage,
                );
            } else if (cloneQueryBuilder.expressionMap.skip !== undefined) {
                this.setPaginationWithJoin(
                    cloneQueryBuilder,
                    pageNumber,
                    numberPerPage,
                );
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
    }

    async getRawManyWithPagination<Entity extends ObjectLiteral>(
        queryBuilder: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number,
    ) {
        numberPerPage ??= PaginationConfig.limit.numberPerPage;

        const cloneQueryBuilder = queryBuilder.clone();

        const totalCount = await queryBuilder.getCount();
        const maxPage = Math.ceil(totalCount / numberPerPage);
        if (pageNumber < 1) {
            pageNumber = 1;
        }

        if (pageNumber > maxPage) {
            pageNumber = maxPage;

            if (cloneQueryBuilder.expressionMap.offset !== undefined) {
                this.setPagination(
                    cloneQueryBuilder,
                    pageNumber,
                    numberPerPage,
                );
            } else if (cloneQueryBuilder.expressionMap.skip !== undefined) {
                this.setPaginationWithJoin(
                    cloneQueryBuilder,
                    pageNumber,
                    numberPerPage,
                );
            }
        }

        const maxBlock = Math.ceil(
            maxPage / PaginationConfig.limit.pagePerBlock,
        );
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
    }
}
