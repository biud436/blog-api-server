import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { TEnvironmentFile } from 'src/common/my-config-service.type';
import { Image } from 'src/controllers/image/entities/image.entity';

export abstract class S3DeleteBucketCommand {
    protected s3!: AWS.S3;

    abstract execute(images: Image[]): Promise<void>;
}

@Injectable()
export class S3DeleteBucketCommandImpl
    extends S3DeleteBucketCommand
    implements OnModuleInit
{
    private logger = new Logger(S3DeleteBucketCommand.name);

    protected s3: AWS.S3 = new AWS.S3({
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
            'AWS_SECRET_ACCESS_KEY',
        ),
        region: 'ap-northeast-2',
    });

    constructor(
        private readonly configService: ConfigService<TEnvironmentFile>,
    ) {
        super();
    }

    onModuleInit() {
        this.logger.debug('S3DeleteBucketCommandImpl onModuleInit');
    }

    execute(images: Image[]): Promise<void> {
        const { s3 } = this;
        const BUCKET =
            this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');

        return new Promise<void>((resolve, reject) => {
            s3.deleteObjects(
                {
                    Bucket: BUCKET,
                    Delete: {
                        Objects: images.map((image) => ({
                            Key: `${image.filename}.${image.mimetype.replace(
                                'image/',
                                '',
                            )}`,
                        })),
                        Quiet: false,
                    },
                },
                (err, data) => {
                    if (err) {
                        this.logger.debug(err);
                        reject(err);
                    }

                    resolve();
                },
            );
        });
    }
}
