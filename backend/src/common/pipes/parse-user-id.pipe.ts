import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { UserService } from 'src/entities/user/user.service';

@Injectable()
export class ParseUserIdPipe implements PipeTransform {
    constructor(private readonly userService: UserService) {}

    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        const user = await this.userService.getUserId(value.user.username);

        return user.id;
    }
}
