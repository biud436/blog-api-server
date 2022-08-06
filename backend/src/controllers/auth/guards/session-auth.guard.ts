import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class SessionAuthGuard extends AuthGuard('session') {
    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        console.log(`request.isAuthenticated() : ${request.isAuthenticated()}`);

        return request.isAuthenticated();
    }
}
