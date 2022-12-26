import { SetMetadata } from '@nestjs/common';

export const MY_CONFIG_METADATA_KEY = 'MY_CONFIG_METADATA_KEY';

export function ConfigData(value: string) {
    return SetMetadata(MY_CONFIG_METADATA_KEY, value);
}
