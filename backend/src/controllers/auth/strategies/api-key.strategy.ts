import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
    constructor(private readonly authService: AuthService) {
        super(
            {
                header: 'X-API-KEY',
                prefix: '',
            },
            true,
            (apiKey, done, req) => {
                this.validate(apiKey, done);
            },
        );
    }

    async validate(
        apiKey: string,
        done: (err: Error, user: any) => void,
    ): Promise<any> {
        const user = await this.authService.validateApiKey(apiKey);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
}
