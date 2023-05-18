/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';
import { ImageService } from '../../controllers/image/image.service';
import { AES256Provider } from 'src/common/modules/aes/aes-256.provider';
import { JwtPayload } from '../../controllers/auth/validator/response.dto';
import { S3Client } from '@aws-sdk/client-s3';
import { TEnvironmentFile } from '../my-config-service.type';

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
        private defaultSettings!: MulterOptions;
        private s3: S3Client = new S3Client({
            credentials: {
                accessKeyId:
                    this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
                secretAccessKey: this.configService.getOrThrow<string>(
                    'AWS_SECRET_ACCESS_KEY',
                ),
            },
            region: 'ap-northeast-2',
        });

        constructor(
            @Optional()
            @Inject(MULTER_MODULE_OPTIONS)
            options: MulterModuleOptions = {},
            private readonly configService: ConfigService<TEnvironmentFile>,
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
            const BUCKET =
                this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');

            this.defaultSettings = {
                storage: multerS3({
                    s3: this.s3 as any,
                    bucket: BUCKET,
                    acl: 'public-read',
                    contentType: multerS3.AUTO_CONTENT_TYPE, // 이 속성을 지정하지 않으면, application/octet-stream으로 설정되어 이미지가 og:image에서 불러와지지 않습니다.
                    key: (req, file, cb) => {
                        const { user } = req.user as JwtPayload;
                        const { username } = user;

                        this.imageService
                            .getTempImageFileName(file.originalname, username!)
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
