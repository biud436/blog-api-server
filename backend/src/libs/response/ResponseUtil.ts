import { HttpException, Injectable } from '@nestjs/common';
import { IResponsableData, IResponse } from './interface/response.interface';

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

    export function successWrap<T extends IResponse>(
        resMessage: T,
        data: any,
    ): IResponsableData {
        return {
            ...resMessage,
            message: resMessage.message,
            result: 'success',
            data,
        };
    }

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

    export function failureWrap<T extends IResponse>(customMessage: T) {
        return {
            name: 'customError',
            statusCode: customMessage.statusCode,
            message: customMessage.message,
            result: 'failure',
        };
    }
}
