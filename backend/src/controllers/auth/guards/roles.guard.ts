import {
    CanActivate,
    ExecutionContext,
    forwardRef,
    Inject,
    Injectable,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/decorators/role.enum';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { AuthService } from '../auth.service';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    private logger: Logger = new Logger(RolesGuard.name);

    constructor(
        private reflector: Reflector,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) {
            return true;
        }
        const req = context.switchToHttp().getRequest() as Request;

        // 토큰을 추출합니다.
        const token = req?.cookies?.access_token;
        // 특정 API를 제외합니다.
        const isIgnoreJwt = Reflect.getOwnMetadata(
            'ignoreJwt',
            context.getHandler(),
        );

        if (isIgnoreJwt) {
            return true;
        }

        const decoded = await this.authService.vertifyAsync(token);
        if (!decoded) {
            return false;
        }
        console.log(
            '토큰 유효성 확인중 ' +
                requiredRoles.some((role) => decoded.role?.includes(role)),
        );

        return requiredRoles.some((role) => decoded.role?.includes(role));
    }
}
