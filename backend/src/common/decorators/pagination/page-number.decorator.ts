import {
    DefaultValuePipe,
    ParseIntPipe,
    PipeTransform,
    Query,
    Type,
} from '@nestjs/common';

export function PageNumber(property?: string): ParameterDecorator {
    return Query(
        property || 'pageNumber',
        new DefaultValuePipe(1),
        ParseIntPipe,
    );
}
