import { Injectable, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { Request } from 'express';

function cookieExtractor(cookieName: string): JwtFromRequestFunction {
    return function (req) {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies[cookieName];
        }
        return token;
    };
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly authService: AuthService,
        private configService: ConfigService,
    ) {
        super({
            jwtFromRequest: () => {
                const authorizationHeader: JwtFromRequestFunction =
                    ExtractJwt.fromAuthHeaderAsBearerToken();

                const mixin: JwtFromRequestFunction = ExtractJwt.fromExtractors(
                    [
                        authorizationHeader,
                        cookieExtractor('access_token'),
                        cookieExtractor('refresh_token'),
                    ],
                );

                return mixin;
            },
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET'),
        });
    }

    async validate(@Req() req: Request, payload: any) {
        return { user: payload.user, role: payload.role };
    }
}
