import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export type MyMulterOption = Pick<
    MulterOptions,
    'limits' | 'dest' | 'fileFilter'
>;

type FileSize = number;
type FILE_LIMIT_MAP = '2MB' | '5MB';
// enum 대신 OBJECT로 선언한다.
const FILE_LIMIT: Record<FILE_LIMIT_MAP, FileSize> = {
    '2MB': 1024 * 1024 * 2,
    '5MB': 1024 * 1024 * 5,
};

export function getMyMulterOption(isProduction: boolean): MyMulterOption {
    return {
        dest: isProduction ? '/usr/src/app/upload/' : './upload',
        limits: {
            fileSize: isProduction ? FILE_LIMIT['2MB'] : FILE_LIMIT['5MB'],
        },
        fileFilter: (
            req: any,
            file: Express.Multer.File,
            cb: (error: Error | null, acceptFile: boolean) => void,
        ) => {
            if (
                ['image/gif', 'image/jpeg', 'image/png'].includes(file.mimetype)
            ) {
                cb(null, true);
            } else {
                cb(new Error('File type is not allowed'), false);
            }
        },
    };
}
