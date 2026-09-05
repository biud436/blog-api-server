import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { ProfileModule } from '../profile/profile.module';
import { ApiKey } from './api-key.entity';
import { ApiKeyService } from './api-key.service';

@Module({
  imports: [StingerloomOrmModule.forFeature([ApiKey]), ProfileModule],
  providers: [ApiKeyService],
  exports: [ApiKeyService],
})
export class ApiKeyModule {}
