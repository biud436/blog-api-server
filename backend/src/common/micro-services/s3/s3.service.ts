import { Injectable } from '@nestjs/common';
import { Image } from 'src/controllers/image/entities/image.entity';
import { S3DeleteBucketCommand } from './s3.delete-bucket.command';

@Injectable()
export class S3Service {
    constructor(
        private readonly s3DeleteBucketCommand: S3DeleteBucketCommand,
    ) {}

    deleteFile(images: Image[]): Promise<void> {
        return this.s3DeleteBucketCommand.execute(images);
    }
}
