import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { ApiKey } from './api-key.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([ApiKey])],
})
export class ApiKeyModule {}
