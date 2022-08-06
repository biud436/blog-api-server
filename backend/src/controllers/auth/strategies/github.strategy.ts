import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { UserCopyService } from 'src/entities/user-copy/user-copy.service';
import { UserService } from 'src/entities/user/user.service';

interface IGithubProfile {
    id: string;
    displayName: string;
    username: string;
    profileUrl: string;
    emails: Array<{ value: string }>;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
    constructor(
        configService: ConfigService,
        private readonly userCopyService: UserCopyService,
    ) {
        super({
            clientID: configService.get('GITHUB_CLIENT_ID', {
                infer: true,
            }),
            clientSecret: configService.get('GITHUB_CLIENT_SECRET', {
                infer: true,
            }),
            callbackURL: configService.get('GITHUB_CALLBACK_URL', {
                infer: true,
            }),
            passReqToCallback: true,
        });
    }

    async validate(
        request: Request, // passReqToCallback
        accessToken: string,
        refreshToken: string,
        profile: IGithubProfile,
    ) {
        // accessToken & refreshToken 저장 필요

        console.log(accessToken);
        console.log(profile);

        // 비동기 처리가 제대로 되지 않음.
        const user = await this.userCopyService.create({
            username: profile.id,
        });

        return {
            user,
            email: profile.emails[0].value,
            name: profile.displayName ?? profile.username,
        };
    }
}
