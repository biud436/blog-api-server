import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'src/entities/user/user.service';
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';

export abstract class ImageTempFileGetterCommand {
  abstract execute(filename: string, username: string): Promise<string>;
}

@Injectable()
export class ImageTempFileGetterCommandImpl extends ImageTempFileGetterCommand {
  constructor(private readonly userService: UserService) {
    super();
  }

  async execute(filename: string, username: string): Promise<string> {
    const filename2 = await this.userService.findProfileByUsername(username);

    if (!filename2) {
      throw new BadRequestException('해당 유저는 존재하지 않습니다.');
    }

    const hashFile = CryptoUtil.uuid().replace(/-/gi, '');
    const tempFileName = CryptoUtil.sha512(username + hashFile);

    return tempFileName;
  }
}
