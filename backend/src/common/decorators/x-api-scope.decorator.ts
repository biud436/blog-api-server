import {
    createParamDecorator,
    ExecutionContext,
    PipeTransform,
    SetMetadata,
    Type,
} from '@nestjs/common';
import { Request } from 'express';
import { ParseXApiUserIdPipe } from 'src/common/pipes/x-api-user-id.pipe';

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
