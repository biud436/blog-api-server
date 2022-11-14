import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import { S3Service } from './s3/s3.service';

@Module({
    imports: [ConfigModule],
    providers: [RedisService, S3Service],
    exports: [RedisService, S3Service],
})
export class MicroServicesModule {}
