import { applyDecorators } from '@nestjs/common';
import { ApiSecurity } from '@nestjs/swagger';

export function ApiKeyAuth() {
    return applyDecorators(ApiSecurity('apiKey'));
}
