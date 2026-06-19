import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { AuthService } from 'src/controllers/auth/auth.service';
import { ApiKeyService } from 'src/domain/api-key/api-key.service';
import { ApiKey } from 'src/domain/api-key/api-key.entity';

@Injectable()
export class ParseXApiUserIdPipe implements PipeTransform {
    constructor(private readonly apiKeyService: ApiKeyService) {}

    async transform(value: any, metadata: ArgumentMetadata): Promise<number> {
        const userId = await this.apiKeyService.getUserId(value);

        return userId;
    }
}
