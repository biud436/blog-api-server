import { ParseUserIdPipe } from 'src/common/pipes/parse-user-id.pipe';
import { UserInfo } from './user.decorator';

export const UserId = (additionalOptions?: any) =>
    UserInfo(additionalOptions, ParseUserIdPipe);
