import {
    Body,
    Controller,
    Get,
    Ip,
    Logger,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import {
    AdminOnly,
    ApiNotebook,
    JwtGuard,
} from 'src/common/decorators/swagger/api-notebook.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { UserInfo } from 'src/common/decorators/authorization/user.decorator';
import { User } from 'src/entities/user/entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { LOGIN_INTERVAL } from 'src/common/config/throttle-config';
import { AuthGuard } from '@nestjs/passport';
import { GithubUser } from './strategies/github.strategy';
import { ProfileUser } from './types/profile-user.type';

@Controller('auth')
@ApiTags('인증 API')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * 로그인을 수행합니다.
     *
     * @tag 인증
     * @assignHeaders authorization
     * @param ip 접속 IP
     * @param user 유저 정보
     * @param res 응답 객체
     * @returns
     */
    @ApiNotebook({
        operation: {
            summary: '로그인',
            description: '로그인을 수행합니다.',
        },
    })
    @Post('/login')
    // 0초에 8번까지만 요청 가능합니다.
    @Throttle({
        default: {
            limit: LOGIN_INTERVAL[0],
            ttl: LOGIN_INTERVAL[1] * 1000,
        },
    })
    @UseGuards(new LocalAuthGuard())
    async login(
        @Ip() ip: string,
        @UserInfo() user: User,
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
    @JwtGuard()
    @AdminOnly()
    @ApiNotebook({
        operation: {
            summary: '로그아웃',
            description: '로그아웃을 수행합니다.',
        },
    })
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
     * 프로필을 조회합니다. 이 기능은 Next.js에서 인증을 수행하기 위해 사용됩니다.
     *
     * @tag 인증
     * @param payload
     * @returns
     */
    @Get('/profile')
    @JwtGuard()
    @AdminOnly()
    @ApiNotebook({
        operation: {
            summary: '프로필 조회',
            description: '프로필을 조회합니다.',
        },
        auth: true,
    })
    async getProfile(@UserInfo() payload: ProfileUser) {
        return await this.authService.getProfile(payload);
    }

    /**
     * 깃허브 계정으로 로그인을 수행합니다.
     *
     * @tag 인증
     * @returns
     */
    @ApiNotebook({
        operation: {
            summary: '깃허브 계정으로 로그인',
            description: '깃허브 계정으로 로그인을 수행합니다.',
        },
    })
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
    @ApiNotebook({
        operation: {
            summary: '깃허브 계정으로 로그인',
            description: '깃허브 계정으로 로그인을 수행합니다.',
        },
    })
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
