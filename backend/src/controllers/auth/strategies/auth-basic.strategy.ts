import { Injectable, Res, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { AuthService } from '../auth.service';
import { RedirectException } from 'src/common/exceptions/redirect.exception';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy, 'basic-auth') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            passReqToCallback: true,
        });
    }

    /**
     * @param username
     * @param password
     * @link https://www.stewright.me/2021/03/add-basic-auth-to-nestjs-rest-api/
     * @returns [Response, RedirectException]
     */
    async validate(username: string, password: string): Promise<boolean> {
        if (
            this.configService.getOrThrow('DOCS_USERNAME') === username &&
            this.configService.getOrThrow('DOCS_PASSWORD') === password
        ) {
            return true;
        }
        throw new RedirectException();
    }
}
