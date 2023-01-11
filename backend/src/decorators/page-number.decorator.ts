import {
    DefaultValuePipe,
    ParseIntPipe,
    PipeTransform,
    Query,
    Type,
} from '@nestjs/common';

export function PageNumber(
    property: string | Type<PipeTransform> | PipeTransform,
): ParameterDecorator {
    return Query(<string>property, new DefaultValuePipe(1), ParseIntPipe);
}
