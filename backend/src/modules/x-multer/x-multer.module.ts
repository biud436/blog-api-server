import { Global, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { getMyMulterOption } from 'src/common/multer.config';

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
    exports: [MulterModule],
})
export class XMulterModule {}
