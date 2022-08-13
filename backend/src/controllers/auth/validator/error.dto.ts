import { HttpException, UnauthorizedException } from '@nestjs/common';

export const BLOG_ERROR_MESSAGE = {
    IS_NOT_AUTHORIZED: '로그인 권한이 없습니다',
};

export class LoginAuthorizationException extends UnauthorizedException {
    constructor() {
        super(BLOG_ERROR_MESSAGE.IS_NOT_AUTHORIZED);
    }
}
