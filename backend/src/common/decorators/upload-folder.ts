import { applyDecorators, Inject } from '@nestjs/common';
import { MULTER_UPLOAD_PATH } from 'src/common/modules/x-multer/x-multer.constants';

export function UploadFolder() {
    return Inject(MULTER_UPLOAD_PATH);
}
