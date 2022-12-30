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

@Catch(HttpException)
export class AllExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse() as Response;
        const request = ctx.getRequest() as Request;
        const status = exception.getStatus();

        response.status(status).json({
            statusCode: status,
            message: exception.message ?? 'Internal Server Error',
            error: exception.name ?? 'Internal Server Error',
        });
    }
}
