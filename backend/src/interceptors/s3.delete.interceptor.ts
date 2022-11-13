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
import { MulterS3File } from './s3.upload.interceptor';

type MulterInstance = any;

export function S3FileDeleteInterceptor(
    fieldName: string,
    localOptions?: MulterOptions,
): Type<NestInterceptor> {
    class MixinInterceptor implements NestInterceptor {
        protected multer: MulterInstance;
        private s3: AWS.S3 = new AWS.S3({
            accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>(
                'AWS_SECRET_ACCESS_KEY',
            ),
            region: 'ap-northeast-2',
        });

        constructor(
            @Optional()
            @Inject(MULTER_MODULE_OPTIONS)
            options: MulterModuleOptions = {},
            private readonly configService: ConfigService,
            private readonly imageService: ImageService,
        ) {
            this.multer = (multer as any)({
                ...options,
                ...localOptions,
            });
        }

        // async deleteFileFromS3(
        //     files: MulterS3File[],
        // ): Promise<AWS.Request<AWS.S3.DeleteObjectOutput, AWS.AWSError>> {
        //     const { s3 } = this;
        //     const BUCKET = this.configService.get<string>('AWS_S3_BUCKET_NAME');
        //     const PARAMS = {
        //         Bucket: BUCKET,
        //         Key: files[0].key,
        //     };

        //     return s3.deleteObject(PARAMS, (err, data) => {
        //         if (err) {
        //             console.log(err);
        //         } else {
        //             console.log(data);
        //         }
        //     });
        // }

        async intercept(
            context: ExecutionContext,
            next: CallHandler,
        ): Promise<Observable<any>> {
            const ctx = context.switchToHttp();

            await new Promise<void>((resolve, reject) => {
                const req = ctx.getRequest();
                const body = req.body;
                // const files = req.files as MulterS3File[];

                console.log(req);
                console.log('----');
                console.log(body);

                // this.deleteFileFromS3(files)
                //     .then(() => {
                //         resolve();
                //     })
                //     .catch((err: any) => {
                //         reject(err);
                //     });
            });

            return next.handle();
        }
    }

    const Interceptor = mixin(MixinInterceptor);
    return Interceptor;
}
