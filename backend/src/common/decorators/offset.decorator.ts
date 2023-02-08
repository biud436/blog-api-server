import {
    applyDecorators,
    ParseIntPipe,
    PipeTransform,
    Query,
    Type,
} from '@nestjs/common';
import { PaginationOffsetPipe } from 'src/common/pipes/pagination-offset.pipe';

export function Offset(
    property: string | (Type<PipeTransform> | PipeTransform),
): ParameterDecorator {
    return Query(<string>property, PaginationOffsetPipe);
}
