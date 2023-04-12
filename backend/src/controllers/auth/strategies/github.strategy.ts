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
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: (error: any, user?: any, info?: any) => void,
    ) {
        const { username, photos, displayName } = profile;
        const user = {
            email: '',
            name: displayName,
            photo: photos[0].value,
            username,
            accessToken,
            refreshToken,
        };
        done(null, user);
    }
}
