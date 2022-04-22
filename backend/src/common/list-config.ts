import { BadRequestException, HttpCode, HttpException } from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import * as validator from 'class-validator';

/**
 * 페이지네이션 설정
 */
export const PaginationConfig = {
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
    },
};

/**
 * 검색 옵션
 */
export const SearchOption = {
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
        return decodeURIComponent(query);
    },
};
