import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Service } from 'typedi';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';

@Service()
export class AWSS3Service implements OnModuleInit {
    private s3 = new AWS.S3();

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        this.initWithCredentials();
    }

    initWithCredentials() {
        AWS.config.update({
            region: 'ap-northeast-2',
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>(
                'AWS_SECRET_ACCESS_KEY',
            ),
        });
    }

    getAWSS3MulterOption(): MulterOptions {
        const { s3 } = this;

        return {
            storage: multerS3({
                s3,
                bucket: this.configService.get<string>('AWS_S3_BUCKET_NAME'),
                key: (req, file, cb) => {
                    cb(
                        null,
                        `original/${Date.now().toString()}_${
                            file.originalname
                        }`,
                    );
                },
                acl: 'public-read-write',
            }),
        };
    }
}
