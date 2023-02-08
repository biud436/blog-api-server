import { ParseXApiUserIdPipe } from 'src/common/pipes/x-api-user-id.pipe';
import { XApiKey } from './x-api-key.decorator';

export const XApiUserId = (additionalOptions?: any) =>
    XApiKey(additionalOptions, ParseXApiUserIdPipe);
