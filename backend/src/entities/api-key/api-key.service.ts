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

    async create(createApiKeyDto: CreateApiKeyDto): Promise<ApiKey> {
        const model = this.apiKeyRepository.create(createApiKeyDto);

        return this.apiKeyRepository.save(model);
    }

    async getUserId(apiKey: string): Promise<number> {
        const model = await this.apiKeyRepository.findOneOrFail({
            where: {
                accessKey: apiKey,
            },
        });

        const { userId } = model;

        return userId;
    }

    async getCount(apiKey: string): Promise<number> {
        const count = await this.apiKeyRepository.count({
            where: {
                accessKey: apiKey,
            },
        });

        return count;
    }
}
