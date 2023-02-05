import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Ip,
    Logger,
    Post,
    Query,
    Render,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/decorators/custom.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { SendAuthCodeRequestDto } from './dto/send-auth-code.dto';
import { ResponseUtil } from 'src/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/libs/response/response';
import { VerifyAuthCodeRequestDto } from './dto/verify-auth-code.dto';
import { AuthRequest } from './validator/request.dto';
import { DocsMapper } from 'src/common/swagger-config';
import { UserInfo } from 'src/decorators/user.decorator';
import { User } from 'src/entities/user/entities/user.entity';
import { DateTimeUtil } from 'src/libs/date/DateTimeUtil';
import { ServerLog } from 'src/libs/logger/ServerLog';
import { ConfigService } from '@nestjs/config';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { promisify } from 'util';
import { HttpService } from '@nestjs/axios';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AxiosResponse } from '@nestjs/terminus/dist/health-indicator/http/axios.interfaces';
import { GithubTokenResponse, GithubUserData } from './validator/github.dto';
import { PrivatePostGuard } from './guards/private-post.guard';
import {
    Anonymous,
    IsReadablePrivatePost,
} from 'src/decorators/anonymous.decorator';
import { PostId } from 'src/decorators/post-id.decorator';
import { PostsService } from '../posts/posts.service';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    private logger: Logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
        private readonly httpService: HttpService,
        private readonly postsService: PostsService,
    ) {}

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
    // @UseGuards(SessionAuthGuard)
    async lgout(
        // @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        // https://discord.com/channels/520622812742811698/606125913343787008/982825765051695115
        // @types/passport@1.0.8
        // req.logout((err) => {
        //     console.warn(err);
        // });
        // await promisify(req.session.destroy.bind(req.session))();

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return ResponseUtil.successWrap(
            {
                message: '로그아웃 되었습니다.',
                statusCode: HttpStatus.OK,
            },
            {},
        );
    }

    @Post('/regenerate/access-token')
    @CustomApiOkResponse({
        description: '토큰 재발급',
        operation: {
            description: '토큰 재발급',
        },
        auth: false,
    })
    async regenerateAccessToken(
        @Req() req: Request,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        return this.authService.regenerateAccessToken(req, res);
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

    @Get('/profile')
    @JwtGuard()
    @AdminOnly()
    @CustomApiOkResponse({
        description: '프로필 조회',
        operation: {
            description: '프로필 조회',
            summary: '프로필 조회',
        },
        auth: true,
    })
    async getProfile(
        @UserInfo() payload: { user: { username: string }; role: string },
    ) {
        try {
            const { username, scope } = await this.authService.getProfile(
                payload,
            );

            return {
                user: {
                    username,
                    scope,
                },
            };
        } catch (e) {
            console.warn(e);
            return {
                user: {},
            };
        }
    }

    @Post('/verify-auth-code')
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
        this.logger.log('정상적으로 호출되었습니다');
        return user;
    }

    @Post('/signup')
    @CustomApiOkResponse(DocsMapper.auth.POST.signup)
    async signup(@Body() data: AuthRequest.RequestDto, @Ip() ip: string) {
        try {
            const res = await this.authService.signUp(data);

            return ResponseUtil.successWrap(RESPONSE_MESSAGE.SUCCESS_SIGNUP, {
                ...res.user,
            });
        } catch (e) {
            return ResponseUtil.failureWrap({
                message: e ? e.message : '회원가입에 실패하였습니다',
                statusCode: HttpStatus.BAD_REQUEST,
            });
        }
    }

    /**
     * ? 1. Request a user's GitHub identity
     * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
     * @returns
     */
    @Get('/github/identity')
    async requestGithubUserIdentity(
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        try {
            const requestUrl =
                await this.authService.requestGithubUserIdentity();

            return requestUrl;
        } catch (e) {
            console.warn(e);
        }
    }

    /**
     * ? 2. Users are redirected back to your site by GitHub
     * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#2-users-are-redirected-back-to-your-site-by-github
     * /github/login
     */
    @Get('/github/callback')
    async loginGithubUser(
        @Query('code') code: string,
        @Query('state') state: string,
    ): Promise<GithubUserData> {
        try {
            return await this.authService.loginGithubUser(code, state);
        } catch (e: any) {
            throw ResponseUtil.failureWrap(e);
        }
    }
}
