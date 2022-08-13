import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKey } from './entities/api-key.entity';

@Injectable()
export class ApiKeyService {
    constructor(
        @InjectRepository(ApiKey)
        private readonly apiKeyRepository: Repository<ApiKey>,
    ) {}

    async getUserId(apiKey: string): Promise<number> {
        const model = await this.apiKeyRepository
            .createQueryBuilder('apiKey')
            .select()
            .where('apiKey.accessKey = :accessKey', { accessKey: apiKey })
            .getOneOrFail();

        const { userId } = model;

        return userId;
    }

    async getCount(apiKey: string): Promise<number> {
        const cnt = this.apiKeyRepository
            .createQueryBuilder('apiKey')
            .select()
            .where('apiKey.accessKey = :accessKey', { accessKey: apiKey })
            .getCount();

        return cnt;
    }
}
