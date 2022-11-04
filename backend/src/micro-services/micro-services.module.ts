import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis/redis.service';

@Module({
    imports: [ConfigModule],
    providers: [RedisService],
    exports: [RedisService],
})
export class MicroServicesModule {}
