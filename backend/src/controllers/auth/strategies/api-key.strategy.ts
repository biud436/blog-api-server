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
            false,
        );
    }

    /**
     * Check weather the access key is valid from the database.
     *
     * @param apiKey
     * @param done
     * @returns
     */
    async validate(apiKey: string) {
        const user = await this.authService.validateApiKey(apiKey);

        return user;
    }
}
