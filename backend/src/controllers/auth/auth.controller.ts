import {
    Body,
    Controller,
    Get,
    HttpService,
    HttpStatus,
    Ip,
    Logger,
    Post,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { CustomApiOkResponse } from 'src/decorators/custom.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SendAuthCodeRequestDto } from './dto/send-auth-code.dto';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { VerifyAuthCodeRequestDto } from './dto/verify-auth-code.dto';
import { AuthRequest } from './validator/request.dto';
import { DocsMapper } from 'src/common/swagger-config';
import { UserInfo } from 'src/decorators/user.decorator';
import { User } from 'src/entities/user/entities/user.entity';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { ServerLog } from 'src/utils/ServerLog';
import { GithubAuthGuard } from './guards/github.guard';
import { ConfigService } from '@nestjs/config';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    private logger: Logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
    ) {}

    @Get('/github')
    @UseGuards(GithubAuthGuard)
    async githubLogin(@Body() data: any, @Ip() ip: string) {
        return 'wow';
    }

    @Get('/github/authorize')
    @UseGuards(GithubAuthGuard)
    @ApiConsumes('application/json')
    async authorizeGithub() {
        return 'wow';
    }

    @Get('/github/callback')
    @UseGuards(GithubAuthGuard)
    async githubCallback(
        @Query('code') code: string,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        return `인증되었습니다.`;
    }

    @Post('/login')
    @UseGuards(new LocalAuthGuard())
    @CustomApiOkResponse(DocsMapper.auth.POST.login)
    @ApiConsumes('application/json')
    async login(
        @UserInfo() user: User,
        @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        const token = await this.authService.login(user);

        return this.authService.loginUseCookieMiddleware(token, req, res);
    }

    /**
     * 로그아웃 (세션 사용)
     *
     * @param req
     * @returns
     */
    @Post('/logout')
    @UseGuards(SessionAuthGuard)
    async lgout(@Req() req: Request) {
        req.logout();

        return ResponseUtil.successWrap(
            {
                message: '로그아웃 되었습니다.',
                statusCode: HttpStatus.OK,
            },
            {},
        );
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

    @Get('/session')
    @UseGuards(SessionAuthGuard)
    async session(@UserInfo() user: User) {
        console.log('정상적으로 호출되었습니다');
        return user;
    }

    @Post('/signup')
    @CustomApiOkResponse(DocsMapper.auth.POST.signup)
    async signup(@Body() data: AuthRequest.RequestDto, @Ip() ip: string) {
        try {
            ServerLog.info(`[${DateTimeUtil.now()}] ${ip} 회원가입 요청`);

            const res = await this.authService.signUp(data);

            return ResponseUtil.successWrap(
                {
                    message: '회원 가입이 완료되었습니다',
                    statusCode: 201,
                },
                {
                    ...res.user,
                },
            );
        } catch (e) {
            if (e) {
                return ResponseUtil.failureWrap(e);
            }

            return ResponseUtil.failureWrap({
                message: e ? e.message : '회원가입에 실패하였습니다',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }
}
