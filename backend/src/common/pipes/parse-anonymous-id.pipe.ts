import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from 'src/entities/user/user.service';

@Injectable()
export class ParseAnonymousIdPipe implements PipeTransform {
    static DEFAULT_ANONYMOUS_ID = 0;

    constructor(private readonly userService: UserService) {}

    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        if (!value) {
            return ParseAnonymousIdPipe.DEFAULT_ANONYMOUS_ID;
        }

        const { username } = value.user;

        const user = await this.userService.getUserIdWithoutFail(username);

        const userId = user?.id ?? 0;

        return userId;
    }
}
