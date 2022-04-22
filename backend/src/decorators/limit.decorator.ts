import {
    applyDecorators,
    ParseIntPipe,
    PipeTransform,
    Query,
    Type,
} from '@nestjs/common';
import { PaginationLimitPipe } from 'src/pipes/pagination-limit.pipe';

export function Limit(
    property: string | (Type<PipeTransform> | PipeTransform),
): ParameterDecorator {
    return Query(<string>property, PaginationLimitPipe);
}
