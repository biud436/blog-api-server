import { ParseIntPipe, Query } from '@nestjs/common';

export function PageSize(): ParameterDecorator {
    return Query('pageSize', ParseIntPipe);
}
