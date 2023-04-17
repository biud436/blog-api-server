import {
    CanActivate,
    ExecutionContext,
    Inject,
    Injectable,
    Optional,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard, AuthModuleOptions } from '@nestjs/passport';
import { Request } from 'express';
import { JwtGuard } from 'src/common/decorators/custom.decorator';
import { ANONYMOUS_ID } from 'src/common/decorators/anonymous.decorator';

/**
 * 토큰을 검증하고 디코딩하지만 오류를 발생시키진 않습니다.
 */
@Injectable()
export class PrivatePostGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext) {
        const requiredRoles = this.reflector.get<boolean>(
            ANONYMOUS_ID,
            context.getHandler(),
        );

        if (!requiredRoles) {
            return true;
        }

        const request = this.getRequest<Request>(context);

        let user: Express.Request['user'] = null;

        try {
            const token = this.getToken(request);
            user = this.jwtService.verify(token) ?? null;
        } catch (e: any) {
            // empty
        }

        request.user = user;

        return true;
    }

    protected getRequest<T>(context: ExecutionContext): T {
        const request = context.switchToHttp().getRequest();
        return request;
    }

    protected getToken(request: {
        cookies: { [key: string]: string };
    }): string {
        const token = request.cookies['access_token'] ?? '';

        if (token === '') {
            // empty
            // console.warn('Token is empty. This user is anonymous.');
        }

        return token;
    }
}
