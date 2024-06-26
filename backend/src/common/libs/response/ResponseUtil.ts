import {
    BadRequestException,
    HttpException,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { IResponsableData, IResponse } from './interface/response.interface';

/**
 * TODO: refactoring 필요
 */
export namespace ResponseUtil {
    export type FailureResponse = IResponse &
        Pick<IResponsableData, 'name' | 'result'>;
    /**
     * 응답에 성공하였을 때, 성공 메시지를 반환합니다.
     *
     * @param resMessage
     * @param data
     * @returns
     */
    export function success(
        resMessage: IResponse,
        data: any,
    ): IResponsableData {
        return {
            ...resMessage,
            message: resMessage.message,
            result: 'success',
            data,
        };
    }

    export function successWrap<
        T extends IResponse,
        R extends Record<string, any>,
    >(resMessage: T, data: R): IResponsableData {
        return {
            ...resMessage,
            message: resMessage.message,
            result: 'success',
            data,
        };
    }

    export const LOGIN_OK = successWrap(
        {
            message: '로그아웃 되었습니다.',
            statusCode: HttpStatus.OK,
        },
        {},
    );

    export const FAILED_TEMP_POST = new BadRequestException(
        '임시 포스트를 불러오는데 실패했습니다.',
    );

    export const FAILED_SEARCH = failureWrap({
        message: '검색에 실패하였습니다.',
        statusCode: HttpStatus.BAD_REQUEST,
        name: 'SearchError',
    });

    /**
     * 응답을 받지 못했을 때, 실패 메시지를 반환합니다.
     * @param resMessage
     * @returns
     */
    export function failure(resMessage: IResponse): FailureResponse {
        return {
            name: 'customError',
            statusCode: resMessage.statusCode,
            message: resMessage.message,
            result: 'failure',
            error: resMessage.error,
        };
    }

    export function failureWrap<T extends Error>(error: T): FailureResponse {
        return {
            name: error.name || 'customError',
            statusCode: (error as any).statusCode || 500,
            message: error.message,
            result: 'failure',
        };
    }
}
