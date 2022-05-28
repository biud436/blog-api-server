import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from 'src/entities/user/user.service';
import validator from 'validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly userService: UserService) {
        super();
    }

    async validate(username: string, password: string) {
        const user = await this.userService.validateUser(username, password);

        if (!user.isValidUser) {
            throw new UnauthorizedException('확인되지 않은 유저입니다');
        }

        if (!user.isCorrectPassword) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다');
        }

        return user.userInfo;
    }
}
