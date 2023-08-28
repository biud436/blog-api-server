import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const XApiKey = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        const key = request.headers['x-api-key'];

        return key;
    },
);
