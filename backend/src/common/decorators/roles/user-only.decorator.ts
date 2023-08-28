import { applyDecorators } from '@nestjs/common';
import { Role } from './role.enum';
import { Roles } from './roles.decorator';

/**
 * 유저와 관리자만 모두 호출할 수 있는 API로 만듭니다.
 * @returns
 */

export function UserOnly(): MethodDecorator & ClassDecorator {
    return applyDecorators(Roles(Role.Admin, Role.User));
}
