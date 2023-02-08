import { SetMetadata } from '@nestjs/common';
import { ParseAnonymousIdPipe } from 'src/common/pipes/parse-anonymous-id.pipe';
import { ParseReadablePrivatePostPipe } from 'src/common/pipes/parse-readable-private-post.pipe';
import { UserInfo } from './user.decorator';

export const ANONYMOUS_ID = 'AnonymousId';
export const Anonymous = () => SetMetadata(ANONYMOUS_ID, true);
export const IsReadablePrivatePost = (additionalOptions?: any) => {
    return UserInfo(additionalOptions, ParseReadablePrivatePostPipe);
};
export const AnonymousId = (additionalOptions?: any) => {
    return UserInfo(additionalOptions, ParseAnonymousIdPipe);
};
