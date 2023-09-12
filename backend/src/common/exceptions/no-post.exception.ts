import { HttpException, HttpStatus } from '@nestjs/common';

export class NoPostException extends HttpException {
    constructor() {
        super('작성된 포스트가 없습니다', HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
