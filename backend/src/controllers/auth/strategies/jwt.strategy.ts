import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => {
                    const encodedToken = req?.cookies?.access_token;

                    return encodedToken;
                },
            ]),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow('JWT_SECRET'),
        });
    }

    async validate(payload: any) {
        return { user: payload.user, role: payload.role };
    }
}
