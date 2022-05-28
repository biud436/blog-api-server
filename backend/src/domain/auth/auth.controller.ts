import {
    Body,
    Controller,
    HttpStatus,
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
import { ApiTags } from '@nestjs/swagger';
import { SendAuthCodeRequestDto } from './dto/send-auth-code.dto';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { VerifyAuthCodeRequestDto } from './dto/verify-auth-code.dto';
import { AuthRequest } from './validator/request.dto';
import { DocsMapper } from 'src/common/swagger-config';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    private logger: Logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

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
