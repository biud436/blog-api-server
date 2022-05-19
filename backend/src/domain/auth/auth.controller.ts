import {
    Body,
    Controller,
    HttpCode,
    HttpException,
    HttpStatus,
    InternalServerErrorException,
    Logger,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { CustomApiOkResponse } from 'src/decorators/custom.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { ChronoUnit, TemporalField, TemporalUnit } from '@js-joda/core';
import { ApiTags } from '@nestjs/swagger';
import { SendAuthCodeRequestDto } from './dto/send-auth-code.dto';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { VerifyAuthCodeRequestDto } from './dto/verify-auth-code.dto';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import { AuthRequest } from './validator/request.dto';
import { DocsMapper } from 'src/common/swagger-config';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    private logger: Logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {}

    @Post('/login')
    @UseGuards(new LocalAuthGuard())
    @CustomApiOkResponse(DocsMapper.auth.POST.login)
    async login(
        @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        try {
            const token = await this.authService.login(req.user);

            // NestJS는 response를 직접 매핑하여 반환하는데, @Res 데코레이터를 사용하면 직접 send를 해야 한다.
            // 그러나 쿠키나 헤더 등 일부만 직접 처리하고,
            // 나머지는 그대로 NestJS에 맡겨 send 하려면 @Res({ passthrough: true })로 설정해야 응답을 제대로 보낼 수 있다.
            res.cookie('access_token', token.accessToken);

            return ResponseUtil.success(RESPONSE_MESSAGE.LOGIN_SUCCESS, {
                accessToken: token.accessToken,
                refreshToken: token.refreshToken,
            });
        } catch (e) {
            this.logger.error(e);
            return ResponseUtil.failure(RESPONSE_MESSAGE.INVALID_PASSWORD);
        }
    }

    @Post('send-auth-code')
    @CustomApiOkResponse(DocsMapper.auth.POST.sendAuthCodeByEmail)
    async sendAuthCodeByEmail(@Body() data: SendAuthCodeRequestDto) {
        try {
            const res = await this.authService.sendAuthCodeByEmail(data.email);
            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap({
                message: e ? e.message : '인증 코드가 일치하지 않습니다.',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }

    @Post('verify-auth-code')
    @CustomApiOkResponse(DocsMapper.auth.POST.verifyAuthCode)
    async verifyAuthCode(@Body() data: VerifyAuthCodeRequestDto) {
        try {
            const res = await this.authService.verifyAuthCode(
                data.email,
                data.authCode,
            );
            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap({
                message: e ? e.message : '인증 코드가 일치하지 않습니다.',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }

    @Post('/signup')
    @CustomApiOkResponse(DocsMapper.auth.POST.signup)
    async signup(@Body() data: AuthRequest.RequestDto) {
        try {
            const res = await this.authService.signUp(data);

            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap({
                message: e ? e.message : '회원가입에 실패하였습니다',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }
}
