import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ParseXApiUserIdPipe } from 'src/pipes/x-api-user-id.pipe';

export const XApiKey = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        const key = request.headers['x-api-key'];

        return key;
    },
);

export const XApiUserId = (additionalOptions?: any) =>
    XApiKey(additionalOptions, ParseXApiUserIdPipe);
