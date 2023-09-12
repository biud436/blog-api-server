import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * @class NotFoundPostException
 * @description 포스트를 불러오는데 실패했을 때 발생하는 예외입니다.
 */
export class NotFoundPostException extends HttpException {
    constructor() {
        super(
            '포스트를 불러오는데 실패했습니다.',
            HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
}
