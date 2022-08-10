import { SetMetadata } from '@nestjs/common';

export const XAPI_SCOPE_KEY = 'x-api-scope';
export const MobileScopeIn = (...scopes: string[]) =>
    SetMetadata('x-api-scope', scopes);

export enum ScopeRoles {
    /**
     * 전체 관리자
     */
    Read = 'read',
    Write = 'write',
    Update = 'update',
    Delete = 'delete',
}
