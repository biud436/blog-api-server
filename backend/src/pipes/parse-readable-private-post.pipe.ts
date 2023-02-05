import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from 'src/entities/user/user.service';
import { ParseAnonymousIdPipe } from './parse-anonymous-id.pipe';

@Injectable()
export class ParseReadablePrivatePostPipe implements PipeTransform {
    static DEFAULT_ANONYMOUS_ID = 0;

    constructor(private readonly userService: UserService) {}

    async transform(value: any, metadata: ArgumentMetadata): Promise<boolean> {
        if (!value) {
            return ParseAnonymousIdPipe.DEFAULT_ANONYMOUS_ID > 0;
        }

        const { username } = value.user;

        const user = await this.userService.getUserIdWithoutFail(username);

        const userId = user?.id ?? 0;

        return userId > 0;
    }
}
