import { applyDecorators, SetMetadata } from '@nestjs/common';

/**
 * IgnoreJwtGuard
 */
export function IgnoreJwtGuard() {
  return applyDecorators(SetMetadata('ignoreJwt', true));
}
