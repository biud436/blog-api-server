import {
    Injectable,
    InternalServerErrorException,
    Logger,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { AdminService } from 'src/entities/admin/admin.service';
import { CreateUserDto } from 'src/entities/user/dto/create-user.dto';
import { UserService } from 'src/entities/user/user.service';
import { Connection } from 'typeorm';
import { AuthRequest } from './validator/request.dto';
import { JwtPayload } from './validator/response.dto';
import * as validator from 'class-validator';
import { DownStreamInternalServerErrorException } from './validator/upstream.error';
import { ProfileService } from 'src/entities/profile/profile.service';
import { Redis, RedisService } from 'src/micro-services/redis/redis.service';
import * as CONFIG from 'src/i18n/auth.json';
import { CryptoUtil } from 'src/utils/CryptoUtil';
import { MailService } from 'src/modules/mail/mail.service';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { IResponsableData } from 'src/utils/response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { CreateProfileDto } from 'src/entities/profile/dto/create-profile.dto';
import { plainToClass } from 'class-transformer';
import Handlebars from 'handlebars';
import { FindUserNameDto } from './dto/find-username.dto';

export type AvailableEmailList =
    | `${string}@gmail.com`
    | `${string}@hanmail.net`
    | `${string}@naver.com`
    | `${string}@nate.com`
    | `${string}@daum.net`
    | `${string}@kakao.com`;

export type EmailAddress = `${AvailableEmailList}`;

export const EMAIL_KEYS = [
    'daum.net',
    'gmail.com',
    'hanmail.net',
    'kakao.com',
    'nate.com',
    'naver.com',
];

@Injectable()
export class AuthService {
    private logger: Logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly profileService: ProfileService,
        private readonly adminService: AdminService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly mailService: MailService,
        @InjectConnection() private connection: Connection,
    ) {}

    /**
     * @method login
     * @description 로그인 처리를 합니다.
     */
    async login(user: any) {
        const payload = <JwtPayload>{ user: user, role: 'user' };
        let isAdmin = false;

        if ('username' in user) {
            isAdmin = await this.adminService.isAdmin(user.username);
        }

        if (isAdmin) {
            payload.role = 'admin';
        }

        if (!['admin'].includes(payload.role)) {
            throw new UnauthorizedException('로그인 권한이 없습니다');
        }

        const accessToken = await this.jwtService.signAsync(payload);
        const refreshToken = await this.jwtService.signAsync(payload, <
            JwtSignOptions
        >{
            secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.configService.get(
                'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
            ),
            algorithm: 'HS384',
        });

        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * 쿠키 처리
     *
     * @param token
     * @param req
     * @param res
     * @returns
     */
    async loginUseCookieMiddleware(
        token: {
            accessToken: string;
            refreshToken: string;
        },
        req: Request,
        res: Response,
    ) {
        let url = this.configService.get('PUBLIC_SERVER_IP');
        url = url.replace('http://', '');
        url = url.replace('https://', '');
        url = url.split(':')[0];

        let jwtSecretExpirationTime = DateTimeUtil.extractJwtExpirationTime(
            this.configService.get('JWT_SECRET_EXPIRATION_TIME'),
        );
        let jwtRefreshTokenExpirationTime =
            DateTimeUtil.extractJwtExpirationTime(
                this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
            );

        res.cookie('access_token', token.accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            expires: DateTimeUtil.toDate(jwtSecretExpirationTime),
        }).cookie('refresh_token', token.refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            expires: DateTimeUtil.toDate(jwtRefreshTokenExpirationTime),
        });

        return ResponseUtil.success(RESPONSE_MESSAGE.LOGIN_SUCCESS, {
            access_token: token.accessToken,
            refresh_token: token.refreshToken,
        });
    }

    /**
     * @description 로그아웃을 처리합니다.
     * @param token
     * @returns
     */

    /**
     * 이메일로 인증 코드 6자리를 전송합니다.
     *
     * @param token
     * @param options
     * @returns
     */
    async sendAuthCodeByEmail(email: EmailAddress) {
        // 가입된 이메일이 있을 때,
        const isValidEmail = await this.profileService.isValidEmail(email);
        if (isValidEmail) {
            throw new DownStreamInternalServerErrorException(
                '이미 가입된 이메일입니다.',
            );
        }

        const isValidEmailFromMap = EMAIL_KEYS.find((e) => e !== email);
        if (!isValidEmailFromMap) {
            throw new DownStreamInternalServerErrorException(
                '지원하지 않는 이메일입니다.',
            );
        }

        // 램덤한 코드를 발급합니다.
        const randomCode = CryptoUtil.getRandomString(6);

        // 2분간 유효한 인증 코드를 이메일로 발급합니다.
        const isSavedOK = await this.redisService.saveAuthorizationCode(
            email,
            randomCode,
            2,
        );

        // 이메일 전송
        await this.mailService.sendAsync({
            from: this.configService.get('GMAIL_USERNAME'),
            to: email,
            subject: '회원 가입 인증 코드가 발급되었습니다.',
            html: `<h1>인증 코드는 <strong>${randomCode}</strong></h1> 입니다.`,
        });

        return {
            email,
            seed: CryptoUtil.uuid(),
            success: true,
        };
    }

    /**
     * 이메일로 전송된 코드를 확인 처리합니다.
     *
     * @param email
     * @param authCode
     * @returns
     */
    async verifyAuthCode(email: EmailAddress, authCode: string) {
        if (!validator.isEmail(email)) {
            throw new DownStreamInternalServerErrorException(
                '이메일 형식이 올바르지 않습니다.',
            );
        }

        const checkAuthCode = /[a-zA-Z0-7]{6}/;
        if (checkAuthCode.exec(authCode) === null) {
            throw new DownStreamInternalServerErrorException(
                '인증번호 형식이 올바르지 않습니다.',
            );
        }

        const getAuthCodeByEmail = await this.redisService.getAuthorizationCode(
            email,
        );
        if (!getAuthCodeByEmail || getAuthCodeByEmail !== authCode) {
            throw new DownStreamInternalServerErrorException(
                '인증번호가 일치하지 않습니다.',
            );
        }

        await this.redisService.set(`auth_code_ok:${email}`, 'true');

        return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, {
            email,
            success: true,
        });
    }

    /**
     * 토큰이 유효한지 확인합니다.
     *
     * @param token
     * @returns
     */
    async vertifyAsync(
        token: string,
        options?: JwtVerifyOptions,
    ): Promise<JwtPayload> {
        return await this.jwtService.verifyAsync(token, options);
    }

    /**
     * 비밀번호 토큰이 유효한지 확인합니다.
     *
     * @param token
     * @returns
     */

    /**
     * 인증 번호 6자리를 발급합니다.
     * 발급 이후 이메일로 전송합니다.
     *
     * @param userEmail 유저 이메일과 인증 코드를 1:1로 대칭시키기 위해 이메일 값을 전송 받습니다.
     * @returns
     */

    /**
     * 인증 여부를 레디스에서 확인합니다
     * @param data
     */

    /**
     * 이메일을 통해 인증 코드를 전송합니다.
     *
     * @param data
     */

    /**
     * 인증 코드와 함께 이메일을 전송합니다.
     * @private
     * @param data
     */

    /**
     * 아이디 찾기
     * @private
     * @param data
     */

    /**
     * 토큰을 새로 발급합니다.
     */
    async generateAccessToken(
        payload: Record<string, any>,
        options?: JwtSignOptions,
    ) {
        return await this.jwtService.signAsync(payload, options);
    }

    /**
     * 회원가입을 처리합니다.
     *
     * @param body
     * @returns
     */
    async signUp(body: AuthRequest.RequestDto) {
        const connection = this.connection;
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        const KEY = `auth_code_ok:${body.email}`;

        try {
            // 유저 데이터를 생성합니다.
            const userDto = new CreateUserDto();
            userDto.email = body.email;
            userDto.password = body.password;
            userDto.username = body.username;

            if (
                !validator.matches(
                    body.password,
                    /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/g,
                )
            ) {
                throw new DownStreamInternalServerErrorException(
                    CONFIG.KOREAN.NOTIFY_ERROR_PASSWORD,
                );
            }

            // 이메일 주소에 대한 유효성을 검증합니다.
            if (!validator.isEmail(body.email)) {
                throw new DownStreamInternalServerErrorException(
                    CONFIG.KOREAN.NOTIFY_ERROR_EMAIL,
                );
            }

            // 이메일 중복 여부를 검사합니다.
            const isValidEmail = await this.profileService.isValidEmail(
                body.email,
            );
            if (isValidEmail) {
                throw new DownStreamInternalServerErrorException(
                    CONFIG.KOREAN.NOTIFY_ERROR_ALREADY_EXIST_EMAIL,
                );
            }

            // 프로필 데이터 생성
            const profileDto = {
                email: body.email,
            };

            // 프로필 모델 저장
            const profileModel = await this.profileService.addProfile(
                profileDto,
                queryRunner,
            );

            if (!profileModel) {
                throw new DownStreamInternalServerErrorException(
                    CONFIG.KOREAN.NOTIFY_ERROR_SAVE_PROFILE,
                );
            }

            // 유저 모델을 저장합니다.
            const userModel = await this.userService.create(
                userDto,
                profileModel,
                queryRunner,
            );

            if (!userModel) {
                throw new DownStreamInternalServerErrorException(
                    CONFIG.KOREAN.NOTIFY_FAILED_SIGNUP,
                );
            }

            // 인증 코드를 확인합니다.
            const authValue = await this.redisService.get(KEY);

            if (authValue !== 'true') {
                throw new DownStreamInternalServerErrorException(
                    CONFIG.KOREAN.NOTIFY_ERROR_AUTH_CODE,
                );
            }

            const { password, ...safelyUserModel } = userModel;

            await queryRunner.commitTransaction();

            return {
                user: safelyUserModel,
                profile: profileModel,
            };
        } catch (e) {
            await queryRunner.rollbackTransaction();

            // 레디스에 저장된 키를 제거합니다.
            const deletedOK = await this.redisService.del(KEY);
            console.log(deletedOK);

            throw new InternalServerErrorException({
                message: CONFIG.KOREAN.NOTIFY_FAILED_SIGNUP,
            });
        } finally {
            // 레디스에 저장된 키를 제거합니다.
            const deletedOK = await this.redisService.del(KEY);
            console.log(deletedOK);

            await queryRunner.release();
        }
    }
}
