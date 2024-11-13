import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TEnvironmentFile } from 'src/common/config/my-config-service.type';
import { Image } from 'src/controllers/image/entities/image.entity';
import { DeleteObjectsCommand, S3, S3Client } from '@aws-sdk/client-s3';

export abstract class S3DeleteBucketCommand {
    protected s3!: S3Client;

    abstract execute(images: Image[]): Promise<void>;
}

@Injectable()
export class S3DeleteBucketCommandImpl
    extends S3DeleteBucketCommand
    implements OnModuleInit
{
    private logger = new Logger(S3DeleteBucketCommand.name);

    protected s3: S3Client;

    constructor(
        private readonly configService: ConfigService<TEnvironmentFile>,
    ) {
        super();
        this.s3 = new S3Client({
            region: 'ap-northeast-2',
            credentials: {
                accessKeyId:
                    this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ),
            },
        });
    }

    onModuleInit() {
        this.logger.debug('S3DeleteBucketCommandImpl onModuleInit');
    }

    async execute(images: Image[]): Promise<void> {
        const { s3 } = this;
        const BUCKET =
            this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');

        try {
            const deleteParams = {
                Bucket: BUCKET,
                Delete: {
                    Objects: images.map((image) => ({
                        Key: `${image.filename}.${image.mimetype.replace('image/', '')}`,
                    })),
                    Quiet: false,
                },
            };

            const command = new DeleteObjectsCommand(deleteParams);
            const response = await this.s3.send(command);

            this.logger.debug('DeleteObjectsCommand response:', response);
        } catch (err) {
            this.logger.error('Error deleting objects from S3:', err);
            throw err;
        }
    }
}
