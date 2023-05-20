import { ArgumentMetadata, Injectable, ParseIntPipe } from '@nestjs/common';
import { PaginationConfig } from 'src/common/config/list-config';

@Injectable()
export class PaginationLimitPipe extends ParseIntPipe {
    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        let limit = await super.transform(value, metadata);

        if (limit <= PaginationConfig.limit.condition.min) {
            limit = PaginationConfig.limit.min;
        }

        if (limit > PaginationConfig.limit.max) {
            limit = PaginationConfig.limit.max;
        }

        return limit;
    }
}
