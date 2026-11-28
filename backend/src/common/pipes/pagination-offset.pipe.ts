import {
    ArgumentMetadata,
    Injectable,
    ParseIntPipe,
    PipeTransform,
} from '@nestjs/common';

@Injectable()
export class PaginationOffsetPipe extends ParseIntPipe {
    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        // optional 옵션 없이는 nil 값에 예외를 던지므로 항상 number 다.
        let offset = (await super.transform(value, metadata)) as number;

        if (offset < 0) {
            offset = 0;
        }

        return offset;
    }
}
