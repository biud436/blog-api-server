import { HttpException, HttpStatus } from '@nestjs/common';

export class RedirectException extends HttpException {
    constructor() {
        super('Redirect', HttpStatus.MOVED_PERMANENTLY);
    }
}
