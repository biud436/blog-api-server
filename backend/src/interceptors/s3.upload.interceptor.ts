import {
    CallHandler,
    ExecutionContext,
    Inject,
    mixin,
    NestInterceptor,
    Optional,
    Type,
} from '@nestjs/common';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as multer from 'multer';
import { Observable } from 'rxjs';
import { transformException } from '@nestjs/platform-express/multer/multer/multer.utils';
import { MULTER_MODULE_OPTIONS } from '@nestjs/platform-express/multer/files.constants';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import { CryptoUtil } from 'src/utils/CryptoUtil';
import { ImageService } from '../controllers/image/image.service';
import { AES256Provider } from 'src/modules/aes/aes-256.provider';
import { JwtPayload } from '../controllers/auth/validator/response.dto';
import { S3Client } from '@aws-sdk/client-s3';

type MulterInstance = any;

/**
 * ? @types/multer-s3의 Express.MulterS3.File[] 타입을 사용하면 버전 호환 문제로 컴파일이 되지 않았습니다.
 * ? 따라서 MulterS3File[] = any[] 타입을 사용합니다.
 */
export type MulterS3File = any;

export function S3FileInterceptor(
    fieldName: string,
    localOptions?: MulterOptions,
): Type<NestInterceptor> {
    class MixinInterceptor implements NestInterceptor {
        protected multer: MulterInstance;
        private defaultSettings: MulterOptions;
        private s3: S3Client = new S3Client({
            credentials: {
                accessKeyId:
                    this.configService.get<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.get<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ),
            },
            region: 'ap-northeast-2',
        });

        constructor(
            @Optional()
            @Inject(MULTER_MODULE_OPTIONS)
            options: MulterModuleOptions = {},
            private readonly configService: ConfigService,
            private readonly imageService: ImageService,
        ) {
            this.initWithDefaultSettings();
            this.multer = (multer as any)({
                ...options,
                ...localOptions,
                ...this.defaultSettings,
            });
        }

        initWithDefaultSettings() {
            const BUCKET = this.configService.get<string>('AWS_S3_BUCKET_NAME');

            this.defaultSettings = {
                storage: multerS3({
                    s3: this.s3,
                    bucket: BUCKET,
                    acl: 'public-read',
                    contentDisposition: 'inline',
                    key: (req, file, cb) => {
                        const { user } = req.user as JwtPayload;
                        const { username } = user;

                        this.imageService
                            .getTempImageFileName(file.originalname, username)
                            .then((filename) => {
                                const extension = file.mimetype.split('/')[1];

                                cb(null, `${filename}.${extension}`);
                            });
                    },
                }),
            };
        }

        async intercept(
            context: ExecutionContext,
            next: CallHandler,
        ): Promise<Observable<any>> {
            const ctx = context.switchToHttp();

            await new Promise<void>((resolve, reject) => {
                this.multer.array(fieldName)(
                    ctx.getRequest(),
                    ctx.getResponse(),
                    (err: any) => {
                        if (err) {
                            const error = transformException(err);
                            return reject(error);
                        }
                        resolve();
                    },
                );
            });

            return next.handle();
        }
    }

    const Interceptor = mixin(MixinInterceptor);
    return Interceptor;
}
