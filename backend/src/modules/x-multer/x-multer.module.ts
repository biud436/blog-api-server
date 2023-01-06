import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { getMyMulterOption } from 'src/common/multer.config';
import { MULTER_UPLOAD_PATH } from './x-multer.constants';

@Global()
@Module({
    imports: [
        MulterModule.registerAsync({
            useFactory: () => {
                const isProduction = process.env.NODE_ENV === 'production';

                return {
                    ...getMyMulterOption(isProduction),
                };
            },
        }),
    ],
    providers: [
        {
            provide: MULTER_UPLOAD_PATH,
            useValue:
                process.env.NODE_ENV === 'production'
                    ? '/usr/src/app/upload/'
                    : './upload',
        },
    ],
    exports: [MulterModule, MULTER_UPLOAD_PATH],
})
export class XMulterModule {}
