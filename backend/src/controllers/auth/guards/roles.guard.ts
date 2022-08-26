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
        const authorization = req.headers['authorization'];
        if (!authorization) {
            return false;
        }

        if (!authorization.startsWith('Bearer ')) {
            this.logger.log(
                "The passed accessToken didn't start with the text 'Bearer '",
            );
            return false;
        }

        // 토큰을 추출합니다.
        const token = authorization.slice(7, authorization.length);

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

        return requiredRoles.some((role) => decoded.role?.includes(role));
    }
}
