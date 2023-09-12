import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * @class DeletePostException
 * @description 포스트를 삭제하는데 실패했습니다.
 */
export class DeletePostException extends HttpException {
    constructor() {
        super(
            '포스트를 삭제하는데 실패했습니다.',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
