import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpCode,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ServerLog } from 'src/libs/logger/ServerLog';
import { Request, Response } from 'express';
import { RedirectException } from './redirect.exception';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';

@Catch()
export class AllExceptionFilter<T> implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse() as Response;
        const request = ctx.getRequest() as Request;

        const classType = exception.name;

        if (exception instanceof RedirectException) {
            console.log('로그인을 해주세요');
            response.status(HttpStatus.UNAUTHORIZED).send({
                message: '인증이 되지 않았습니다.',
            });
        } else {
            const status =
                exception instanceof HttpException
                    ? exception.getStatus()
                    : HttpStatus.INTERNAL_SERVER_ERROR;

            console.log('전달된 BODY : ' + JSON.stringify(request.body ?? ''));
            console.log('오류를 캐치하였습니다 : ' + exception.message);
            console.log(`${exception.stack}`);

            const data = exception.getResponse() as any;

            if (Array.isArray(data.message)) {
                data.message = data.message.join(',');
            }

            if (data.message === '') {
                data.message = 'Unknown Error';
            }

            response.status(status).json({
                name: 'serverError',
                message: exception.message,
                ...data,
            });
        }
    }
}
