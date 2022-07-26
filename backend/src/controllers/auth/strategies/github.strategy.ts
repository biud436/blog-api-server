import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';
import { UserCopyService } from 'src/entities/user-copy/user-copy.service';
import { UserService } from 'src/entities/user/user.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        configService: ConfigService,
        private readonly userCopyService: UserCopyService,
    ) {
        super(
            {
                clientID: configService.get('GITHUB_CLIENT_ID'),
                clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
                callbackURL: configService.get('GITHUB_CALLBACK_URL'),
            },
            (accessToken, refreshToken, profile, done) => {
                this.validate(accessToken, refreshToken, profile, done);
            },
        );
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user: any) => void,
    ) {
        // accessToken & refreshToken 저장 필요

        console.log(accessToken);
        console.log(profile);

        // 비동기 처리가 제대로 되지 않음.
        const user = await this.userCopyService.create({
            username: profile.id,
        });

        if (user) {
            done(null, user);
            return true;
        }

        done(new Error('User not found'), null);
        return false;
    }
}
