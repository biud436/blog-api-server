import { SetMetadata } from '@nestjs/common';

export const TRANSACTIONAL_ZONE_TOKEN = 'TRANSACTIONAL_ZONE_TOKEN';

export function TransactionalZone(): ClassDecorator {
    return SetMetadata(TRANSACTIONAL_ZONE_TOKEN, true);
}
