import { PickType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ApiKey } from '../entities/api-key.entity';

export class CreateApiKeyDto extends ApiKey {}
