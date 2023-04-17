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
} from 'src/common/decorators/custom.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import {
    ApiConsumes,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { SendAuthCodeRequestDto } from './dto/send-auth-code.dto';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { VerifyAuthCodeRequestDto } from './dto/verify-auth-code.dto';
import { AuthRequest } from './validator/request.dto';
import { DocsMapper } from 'src/common/swagger-config';
import { UserInfo } from 'src/common/decorators/user.decorator';
import { User } from 'src/entities/user/entities/user.entity';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { ServerLog } from 'src/common/libs/logger/ServerLog';
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
} from 'src/common/decorators/anonymous.decorator';
import { PostId } from 'src/common/decorators/post-id.decorator';
import { PostsService } from '../posts/posts.service';
import { PageNumber } from 'src/common/decorators/page-number.decorator';
import { Throttle } from '@nestjs/throttler';
import { LOGIN_INTERVAL } from 'src/common/throttle-config';
import { TEnvironmentFile } from 'src/common/my-config-service.type';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from './validator/response.dto';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    private logger: Logger = new Logger(AuthController.name);

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService<TEnvironmentFile>,
        private readonly httpService: HttpService,
        private readonly postsService: PostsService,
    ) {}

    /**
     * 로그인
     *
     * @param ip
     * @param user
     * @param req
     * @param res
     * @returns
     */
    @Post('/login')
    @Throttle(...LOGIN_INTERVAL)
    @UseGuards(new LocalAuthGuard())
    @CustomApiOkResponse(DocsMapper.auth.POST.login)
    @ApiResponse({
        status: HttpStatus.TOO_MANY_REQUESTS,
        description: '요청이 너무 많습니다. 잠시후에 시도해주세요.',
    })
    @ApiConsumes('application/json')
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

    @Get('/users')
    @CustomApiOkResponse({
        description: '유저 목록 조회',
        operation: {},
        auth: true,
    })
    @ApiQuery({
        name: 'pageNumber',
        description: '페이지 번호',
    })
    async getUserList(@PageNumber('pageNumber') pageNumber: number) {
        return await this.authService.getUserList(pageNumber);
    }

    @ApiOperation({
        summary: '깃허브 로그인',
        description: '깃허브로 OAuth 2.0 로그인을 수행합니다.',
    })
    @ApiResponse({
        status: HttpStatus.MOVED_PERMANENTLY,
    })
    @Get('/github/login')
    @UseGuards(AuthGuard('github'))
    async loginByGithub() {
        return true;
    }

    @ApiOperation({
        summary: '깃허브 콜백',
        description:
            'CLIENT_ID와 CLIENT_SECRET을 이용하여 로그인이 수행되면 절차를 밟아 콜백을 받습니다.',
    })
    @Get('/github/callback')
    @UseGuards(AuthGuard('github'))
    async loginGithubUser(
        @Req() req,
        @Res({
            passthrough: true,
        })
        res: Response,
    ) {
        const user = req.user;
        return await this.authService.loginGithubUser(user, res);
    }
}
