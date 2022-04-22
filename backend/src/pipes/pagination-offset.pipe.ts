import {
    ArgumentMetadata,
    Injectable,
    ParseIntPipe,
    PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PaginationOffsetPipe extends ParseIntPipe {
    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        let offset = await super.transform(value, metadata);

        if (offset < 0) {
            offset = 0;
        }

        return offset;
    }
}
