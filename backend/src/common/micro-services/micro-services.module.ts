import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis/redis.service';
import {
    S3DeleteBucketCommand,
    S3DeleteBucketCommandImpl,
} from './s3/s3.delete-bucket.command';
import { S3Service } from './s3/s3.service';

@Module({
    imports: [ConfigModule],
    providers: [
        RedisService,
        S3Service,
        {
            provide: S3DeleteBucketCommand,
            useClass: S3DeleteBucketCommandImpl,
        },
    ],
    exports: [RedisService, S3Service],
})
export class MicroServicesModule {}
