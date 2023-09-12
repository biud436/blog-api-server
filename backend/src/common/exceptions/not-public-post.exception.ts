import { HttpException, HttpStatus } from '@nestjs/common';

export class NotPublicPostException extends HttpException {
    constructor() {
        super(
            '포스트를 찾을 수 없거나 비공개 포스트입니다.',
            HttpStatus.FORBIDDEN,
        );
    }
}
