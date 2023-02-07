import { BadRequestException, HttpCode, HttpException } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import * as validator from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Pagination {
    export type Config = {
        limit: {
            condition: {
                min: number;
            };
            max: number;
            min: number;
            numberPerPage: number;
            pagePerBlock: number;
        };
    };
}

/**
 * 페이지네이션 설정
 */
export const PaginationConfig = <Pagination.Config>{
    limit: {
        /**
         * 조건문 체크
         */
        condition: {
            min: 0,
        },
        /**
         * 최대 조회 갯수
         */
        max: 15,
        /**
         * 최소 조회 갯수
         */
        min: 1,

        /**
         * 페이지 당 게시물 수
         */
        numberPerPage: 5,

        /**
         * 블럭 당 페이지 수
         *
         */
        pagePerBlock: 10,
    },
};

export class PaginationFlushObject {
    /**
     * 현재 페이지
     */
    currentPage: number;
    /**
     * 전체 페이지 수
     */
    maxPage: number;
    /**
     * 전체 게시물 수
     */
    totalRecord: number;
    /**
     * 현재 페이지 블럭
     */
    currentBlock: number;
    /**
     * 전체 블럭 수
     */
    totalBlock: number;
}

export type PaginationResult = {
    totalCount: number;
    currentPage: number;
    maxPage: number;
    currentBlock: number;
    maxBlock: number;
};

export type PaginableWithCount<T> = {
    entities: T[];
    count: number;
};

/**
 * 페이지네이션 가능한 타입
 */
export type Paginatable<T> = {
    pagination: PaginationResult;
    entities: T[];
};

/**
 * 검색 옵션
 */
export const SearchOption: { handleQuery: (query: string) => never | string } =
    {
        /**
         * 검색어를 처리합니다.
         *
         * @param query
         * @returns
         */
        handleQuery: (query: string) => {
            if (!validator.isString(query) || query.length === 0) {
                throw new BadRequestException('검색어를 입력하세요.');
            }
            if (query.split('').find((e) => ['%', '_'].includes(e))) {
                throw new BadRequestException(
                    '검색어에 특수문자를 사용할 수 없습니다.',
                );
            }
            return decodeURIComponent(query);
        },
    };
