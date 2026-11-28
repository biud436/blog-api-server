import { ArgumentMetadata, Injectable, ParseIntPipe } from '@nestjs/common';
import { PaginationConfig } from 'src/common/config/list-config';

@Injectable()
export class PaginationLimitPipe extends ParseIntPipe {
    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        // optional 옵션 없이는 nil 값에 예외를 던지므로 항상 number 다.
        let limit = (await super.transform(value, metadata)) as number;

        if (limit <= PaginationConfig.limit.condition.min) {
            limit = PaginationConfig.limit.min;
        }

        if (limit > PaginationConfig.limit.max) {
            limit = PaginationConfig.limit.max;
        }

        return limit;
    }
}
