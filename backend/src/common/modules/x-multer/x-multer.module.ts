import { DynamicModule, Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { getMyMulterOption } from 'src/common/config/multer.config';
import { XMulterModuleOptions } from './interfaces/x-multer-option.interface';
import { MULTER_UPLOAD_PATH } from './x-multer.constants';

@Global()
@Module({})
export class XMulterModule {
    static forRoot(options: XMulterModuleOptions): DynamicModule {
        return {
            module: XMulterModule,
            imports: [
                MulterModule.registerAsync({
                    useFactory: () => {
                        const isProduction =
                            process.env.NODE_ENV === 'production';

                        return {
                            ...getMyMulterOption(isProduction),
                        };
                    },
                }),
            ],
            providers: [
                {
                    provide: MULTER_UPLOAD_PATH,
                    useFactory: () => options.dest,
                },
            ],
            exports: [MulterModule, MULTER_UPLOAD_PATH],
        };
    }
}
