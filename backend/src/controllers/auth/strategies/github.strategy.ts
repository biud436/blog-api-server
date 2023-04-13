import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-github2';
import { Role } from 'src/common/decorators/role.enum';
import { UserCopyService } from 'src/entities/user-copy/user-copy.service';
import { UserService } from 'src/entities/user/user.service';

interface IGithubProfile {
    id: string;
    displayName: string;
    username: string;
    profileUrl: string;
    emails: Array<{ value: string }>;
}

export interface GithubUser {
    email: string;
    name: string;
    photo: string;
    username: string;
    accessToken: string;
    refreshToken: string;
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
            scope: ['user', 'public_profile'],
        });
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any, info?: any) => void,
    ) {
        const { username, photos, displayName } = profile;
        const user = {
            email: profile.emails[0].value,
            name: displayName,
            photo: photos[0].value,
            username,
            accessToken,
            refreshToken,
        };

        done(null, user);
    }
}
