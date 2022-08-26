import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest() as Request;

        return request.isAuthenticated();
    }
}
