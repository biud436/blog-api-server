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
            (apiKey: any, done: any, req: any) => {
                this.validate(apiKey, done);
            },
        );
    }

    /**
     * Check weather the access key is valid from the database.
     *
     * @param apiKey
     * @param done
     * @returns
     */
    async validate(
        apiKey: string,
        done: (err: Error | null, user: any) => void,
    ): Promise<any> {
        const user = await this.authService.validateApiKey(apiKey);
        if (!user) {
            return done(null, false);
        }
        return done(null, user);
    }
}
