import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
    Injectable,
} from '@nestjs/common';
import { Request, response, Response } from 'express';

@Catch()
export class UnauthorizedExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        return response.status(HttpStatus.UNAUTHORIZED).json({
            name: 'serverError',
            message: '인증이 되지 않았습니다.',
        });
    }
}
