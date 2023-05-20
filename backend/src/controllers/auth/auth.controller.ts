import {
    Body,
    Controller,
    Get,
    HttpStatus,
    Ip,
    Logger,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AdminOnly, JwtGuard } from 'src/common/decorators/custom.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { SendAuthCodeRequestDto } from './dto/send-auth-code.dto';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { VerifyAuthCodeRequestDto } from './dto/verify-auth-code.dto';
import { AuthRequest } from './validator/request.dto';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { User } from 'src/entities/user/entities/user.entity';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { LOGIN_INTERVAL } from 'src/common/throttle-config';
import { AuthGuard } from '@nestjs/passport';
import { GithubUser } from './strategies/github.strategy';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    private logger: Logger = new Logger(AuthController.name);

    constructor(private readonly authService: AuthService) {}

    /**
     * 로그인을 수행합니다.
     *
     * @tag 인증
     * @param ip 접속 IP
     * @param user 유저 정보
     * @param req 요청 객체
     * @param res 응답 객체
     * @returns
     */
    @Post('/login')
    @Throttle(...LOGIN_INTERVAL)
    @UseGuards(new LocalAuthGuard())
    async login(
        @Ip() ip: string,
        @UserInfo() user: User,
        @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        await this.authService.createConnectInfo(ip);
        const token = await this.authService.login(user);

        return this.authService.loginUseCookieMiddleware(token, res);
    }

    /**
     * 로그아웃을 수행합니다.
     *
     * @tag 인증
     * @param res
     * @returns
     */
    @Post('/logout')
    async lgout(
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return ResponseUtil.LOGIN_OK;
    }

    /**
     * 액세스 토큰을 재발급합니다.
     *
     * @tag 인증
     * @deprecated
     * @param req
     * @param res
     * @returns
     */
    @Post('/regenerate/access-token')
    async regenerateAccessToken(
        @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        return this.authService.regenerateAccessToken(req, res);
    }

    /**
     * 인증 코드를 이메일로 전송합니다.
     *
     * @tag 인증
     * @param data
     * @returns
     */
    @Post('send-auth-code')
    async sendAuthCodeByEmail(@Body() data: SendAuthCodeRequestDto) {
        try {
            const res = await this.authService.sendAuthCodeByEmail(data.email);
            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e) {
            throw ResponseUtil.failureWrap({
                message: '인증 코드가 일치하지 않습니다.',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }

    /**
     * 프로필을 조회합니다. 이 기능은 Next.js에서 인증을 수행하기 위해 사용됩니다.
     *
     * @tag 인증
     * @param payload
     * @returns
     */
    @Get('/profile')
    @JwtGuard()
    @AdminOnly()
    async getProfile(
        @UserInfo() payload: { user: { username: string }; role: string },
    ) {
        try {
            const { id, username, scope } = await this.authService.getProfile(
                payload,
            );

            return {
                user: {
                    id,
                    username,
                    scope,
                },
            };
        } catch (e) {
            return {
                user: {},
            };
        }
    }

    /**
     * 인증 코드를 확인합니다.
     *
     * @tag 인증
     * @param data
     * @returns
     */
    @Post('/verify-auth-code')
    async verifyAuthCode(@Body() data: VerifyAuthCodeRequestDto) {
        try {
            const res = await this.authService.verifyAuthCode(
                data.email,
                data.authCode,
            );
            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e: any) {
            throw ResponseUtil.failureWrap({
                message: e ? e.message : '인증 코드가 일치하지 않습니다.',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }

    /**
     * 회원 가입을 처리합니다.
     *
     * @tag 인증
     * @param data
     * @returns
     */
    @Post('/signup')
    async signup(@Body() data: AuthRequest.RequestDto) {
        try {
            const res = await this.authService.signUp(data);

            return ResponseUtil.successWrap(RESPONSE_MESSAGE.SUCCESS_SIGNUP, {
                ...res.user,
            });
        } catch (e) {
            throw ResponseUtil.failureWrap({
                message: '회원가입에 실패하였습니다',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }

    /**
     * 깃허브 계정으로 로그인을 수행합니다.
     *
     * @tag 인증
     * @returns
     */
    @Get('/github/login')
    @UseGuards(AuthGuard('github'))
    async loginByGithub() {
        return true;
    }

    /**
     * 깃허브 계정으로 로그인에 성공하면 액세스 토큰을 발급합니다.
     *
     * @tag 인증
     * @param req
     * @param res
     * @returns
     */
    @Get('/github/callback')
    @UseGuards(AuthGuard('github'))
    async loginGithubUser(
        @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        const user = req.user;
        return await this.authService.loginGithubUser(user as GithubUser, res);
    }
}
