import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
    ParseUserIdPipe,
    ParseXApiUserIdPipe,
} from 'src/pipes/x-api-user-id.pipe';
import { UserInfo } from './user.decorator';

export const XApiKey = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        const key = request.headers['x-api-key'];

        return key;
    },
);

export const UserId = (additionalOptions?: any) =>
    UserInfo(additionalOptions, ParseUserIdPipe);

export const XApiUserId = (additionalOptions?: any) =>
    XApiKey(additionalOptions, ParseXApiUserIdPipe);
