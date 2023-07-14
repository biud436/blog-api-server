import { Injectable } from '@nestjs/common';
import {
    Paginatable,
    PaginationConfig,
    PaginationResult,
} from 'src/common/config/list-config';
import {
    EntityManager,
    EntityTarget,
    ObjectLiteral,
    QueryRunner,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';
import { IPaginationProvider } from './pagination-provider.interface';
import {
    PaginationGetStrategy,
    PaginationStrategy,
} from './pagination.constant';

/**
 * @class PaginationProvider
 * @author Jinseok Eo(biud436)
 */
@Injectable()
export class PaginationProvider implements IPaginationProvider {
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

    async execute<Entity extends ObjectLiteral>(
        qb: SelectQueryBuilder<Entity>,
        pageNumber: number,
        numberPerPage?: number | undefined,
        getStrategy = PaginationGetStrategy.GET_MANY,
        strategy = PaginationStrategy.OFFSET,
    ): Promise<Paginatable<Entity>> {
        const setPagination: (
            qb: SelectQueryBuilder<Entity>,
            pageNumber: number,
            numberPerPage?: number,
        ) => this =
            strategy === PaginationStrategy.SKIP
                ? this.setPaginationWithJoin.bind(this)
                : this.setPagination.bind(this);

        switch (getStrategy) {
            case PaginationGetStrategy.GET_MANY:
                return setPagination(
                    qb,
                    pageNumber,
                    numberPerPage,
                ).getManyWithPagination(qb, pageNumber, numberPerPage);
            case PaginationGetStrategy.GET_RAW_MANY:
                return setPagination(
                    qb,
                    pageNumber,
                    numberPerPage,
                ).getRawManyWithPagination(qb, pageNumber, numberPerPage);
        }
    }
}
