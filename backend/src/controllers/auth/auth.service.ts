/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { CookieOptions, Response } from 'express';
import { AdminService } from 'src/entities/admin/admin.service';
import { CreateUserDto } from 'src/entities/user/dto/create-user.dto';
import { UserService } from 'src/entities/user/user.service';
import { DataSource } from 'typeorm';
import { AuthRequest } from './validator/request.dto';
import { JwtPayload } from './validator/response.dto';
import * as validator from 'class-validator';
import { DownStreamInternalServerErrorException } from './validator/upstream.error';
import { ProfileService } from 'src/entities/profile/profile.service';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';
import { MailService } from 'src/common/modules/mail/mail.service';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { plainToClass } from 'class-transformer';
import { LoginAuthorizationException } from './validator/error.dto';
import { ApiKeyService } from 'src/entities/api-key/api-key.service';
import { User } from 'src/entities/user/entities/user.entity';
import { Role } from 'src/common/decorators/authorization/role.enum';
import { HttpService } from '@nestjs/axios';
import { GithubUserData } from './validator/github.dto';
import { AES256Provider } from 'src/common/modules/aes/aes-256.provider';
import { ConnectInfoService } from 'src/entities/connect-info/connect-info.service';
import { GithubUser } from './strategies/github.strategy';
import { I18nConfig } from './libs/i18n';
import {
  getCookieSettingWithAccessToken,
  getCookieSettingWithRefreshToken,
} from './utils/cookie-utils';
import { EmailAddress, EMAIL_KEYS } from './libs/email';
import { ProfileUser } from './types/profile-user.type';
import { ProfileUserDto } from './dto/profile-user.dto';

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
    private readonly apiKeyService: ApiKeyService,
    private readonly dataSource: DataSource,
    private readonly httpService: HttpService,
    private readonly aes256Provider: AES256Provider,
    private readonly connectInfoService: ConnectInfoService,
  ) {}

  /**
   * Performs the login using LocalStrategy
   *
   * @param user LocalStrategy에 의해 검증된 유저 정보
   */
  public async login(
    user: Omit<
      User,
      'password' | 'hashPassword' | 'savePassword' | 'profileId'
    >,
  ) {
    try {
      const payload = <JwtPayload>{ user: user, role: 'user' };
      let isAdmin = false;

      if ('username' in user) {
        isAdmin = await this.adminService.isAdmin(user.username);
      }

      if (isAdmin) {
        payload.role = 'admin';
      }

      if (!['admin'].includes(payload.role!)) {
        throw new LoginAuthorizationException();
      }

      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, <
        JwtSignOptions
      >{
        secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        ),
        algorithm: 'HS384',
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (e: any) {
      const status = e.status || 500;
      if ([400, 401, 403, 404, 500].includes(status)) {
        throw new UnauthorizedException(e.message);
      }

      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * Performs the login using Github OAuth2
   *
   * @param githubPayload
   * @param res
   */
  public async loginGithubUser(githubPayload: GithubUser, res: Response) {
    try {
      if (!githubPayload) {
        throw new UnauthorizedException('Github User Not Found');
      }

      const user = githubPayload;

      const payload = <JwtPayload>{ user: user, role: 'user' };

      // 깃허브 아이디를 확인하고, 해당 유저가 있는지 확인한다,
      const username = user.username;

      const authorizedUser =
        await this.userService.findProfileByUsername(username);

      // 유저가 없으면 보통 회원 가입이 순례이지만, 회원 가입 기능이 없는 사이트이므로 401 에러를 던진다.
      if (!authorizedUser) {
        throw new UnauthorizedException('User Not Found');
      }

      // 본 블로그에서는 관리자 권한을 가진 유저를 별도의 테이블에 따로 관리한다.
      // 따라서 관리자인지 확인하는 코드는 아래와 같다.
      let isAdmin = false;

      if ('username' in authorizedUser) {
        isAdmin = await this.adminService.isAdmin(username);
      }

      if (isAdmin) {
        payload.role = 'admin';
      }

      // 관리자가 아니라면 오류를 던진다.
      if (!['admin'].includes(payload.role!)) {
        throw new LoginAuthorizationException();
      }

      // 깃허브를 통해 인증이 완료되었으므로 자체 로그인에 호환되는 JWT 토큰을 발급한다.
      const accessToken = await this.jwtService.signAsync(payload);
      const refreshToken = await this.jwtService.signAsync(payload, <
        JwtSignOptions
      >{
        secret: this.configService.getOrThrow('JWT_REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow(
          'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
        ),
        algorithm: 'HS384',
      });

      // 쿠키 방식의 토큰 로그인이므로 쿠키를 생성한다.
      await this.loginUseCookieMiddleware(
        {
          accessToken,
          refreshToken,
        },
        res,
      );

      // 로그인에 성공하였으므로 블로그로 다시 리다이렉트 처리를 한다.
      const blogUrl = this.configService.getOrThrow('BLOG_URL');
      res.redirect(blogUrl);
    } catch (e: any) {
      const status = e.status || 500;
      if ([400, 401, 403, 404, 500].includes(status)) {
        throw new UnauthorizedException(e.message);
      }

      throw new InternalServerErrorException(e.message);
    }
  }

  public async createConnectInfo(ip: string) {
    await this.connectInfoService.create({
      ip: ip,
      userAgent: 'unknown',
    });
  }

  /**
   * 쿠키 처리
   *
   * @param token
   * @param req
   * @param res
   * @returns
   */
  public async loginUseCookieMiddleware(
    token: {
      accessToken: string;
      refreshToken: string;
    },
    res: Response,
  ) {
    let url = this.configService.get('PUBLIC_SERVER_IP');
    url = url.replace('http://', '');
    url = url.replace('https://', '');
    url = url.split(':')[0];

    const jwtSecretExpirationTime = DateTimeUtil.extractJwtExpirationTime(
      this.configService.getOrThrow('JWT_SECRET_EXPIRATION_TIME'),
    );
    const jwtRefreshTokenExpirationTime = DateTimeUtil.extractJwtExpirationTime(
      this.configService.getOrThrow('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );

    const encodedAccess = token.accessToken;
    const encodedRefresh = token.refreshToken;

    res
      .cookie('access_token', encodedAccess, <CookieOptions>{
        ...getCookieSettingWithAccessToken(jwtSecretExpirationTime),
      })
      .cookie('refresh_token', encodedRefresh, <CookieOptions>{
        ...getCookieSettingWithRefreshToken(jwtRefreshTokenExpirationTime),
      });

    return ResponseUtil.success(RESPONSE_MESSAGE.LOGIN_SUCCESS, {});
  }

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

    const getAuthCodeByEmail =
      await this.redisService.getAuthorizationCode(email);
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
   * 토큰을 새로 발급합니다.
   */
  async generateAccessToken(
    payload: Record<string, any>,
    options?: JwtSignOptions,
  ) {
    return await this.jwtService.signAsync(payload, options);
  }

  /**
   * 회원가입을 처리합니다 (회원 가입 기능이 없는 블로그이므로 사용하지 않습니다)
   *
   * @deprecated
   * @param body
   * @returns
   */
  async signUp(body: AuthRequest.RequestDto) {
    const connection = this.dataSource;
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
          I18nConfig.KOREAN.NOTIFY_ERROR_PASSWORD,
        );
      }

      // 이메일 주소에 대한 유효성을 검증합니다.
      if (!validator.isEmail(body.email)) {
        throw new DownStreamInternalServerErrorException(
          I18nConfig.KOREAN.NOTIFY_ERROR_EMAIL,
        );
      }

      // 이메일 중복 여부를 검사합니다.
      const isValidEmail = await this.profileService.isValidEmail(body.email);
      if (isValidEmail) {
        throw new DownStreamInternalServerErrorException(
          I18nConfig.KOREAN.NOTIFY_ERROR_ALREADY_EXIST_EMAIL,
        );
      }

      // 프로필 데이터 생성
      const profileDto = {
        email: body.email,
        nickname: body.nickname,
      };

      // 프로필 모델 저장
      const profileModel = await this.profileService.addProfile(
        profileDto,
        queryRunner,
      );

      if (!profileModel) {
        throw new DownStreamInternalServerErrorException(
          I18nConfig.KOREAN.NOTIFY_ERROR_SAVE_PROFILE,
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
          I18nConfig.KOREAN.NOTIFY_FAILED_SIGNUP,
        );
      }

      // 인증 코드를 확인합니다.
      const authValue = await this.redisService.get(KEY);

      if (authValue !== 'true') {
        throw new DownStreamInternalServerErrorException(
          I18nConfig.KOREAN.NOTIFY_ERROR_AUTH_CODE,
        );
      }

      const { password, ...safelyUserModel } = userModel;

      await queryRunner.commitTransaction();

      return {
        user: safelyUserModel,
        profile: profileModel,
      };
    } catch (e: any) {
      await queryRunner.rollbackTransaction();

      // 레디스에 저장된 키를 제거합니다.
      const deletedOK = await this.redisService.del(KEY);

      throw new InternalServerErrorException({
        message: e.message ?? I18nConfig.KOREAN.NOTIFY_FAILED_SIGNUP,
      });
    } finally {
      // 레디스에 저장된 키를 제거합니다.
      const deletedOK = await this.redisService.del(KEY);

      await queryRunner.release();
    }
  }

  async validateApiKey(apiKey: string) {
    const model = await this.apiKeyService.findOneByApiKey(apiKey);

    return model;
  }

  async getProfile(payload: ProfileUser) {
    try {
      const { user } = payload;

      if (!user) {
        throw new UnauthorizedException({
          name: 'NOT_FOUND_USER',
          message: '유저 데이터가 없습니다 [1]',
        });
      }

      const profileUser = await this.userService.findProfileByUsername(
        user.username,
      );

      if (!profileUser) {
        throw new UnauthorizedException({
          name: 'NOT_FOUND_USER',
          message: '유저 데이터가 없습니다 [2]',
        });
      }

      let isAdmin = false;
      let scope = Role.User;

      // 권한이 있는지 확인합니다.
      if ('username' in user) {
        isAdmin = await this.adminService.isAdmin(user.username);
      }

      if (isAdmin) {
        scope = Role.Admin;
      }

      const res = {
        ...plainToClass(User, profileUser),
        scope: [scope],
      };

      return ProfileUserDto.of(res.id, res.username, res.scope as string[]);
    } catch (e: any) {
      this.logger.error(e.message);

      return {
        user: {},
      };
    }
  }

  async getUserList(pageNumber: number) {
    try {
      const users = await this.userService.getUserList(pageNumber);

      return ResponseUtil.successWrap(
        {
          message: '유저 목록',
          statusCode: 200,
        },
        users as any,
      );
    } catch (e: any) {
      throw new InternalServerErrorException(e.message);
    }
  }

  /**
   * ? 1. Request a user's GitHub identity
   * https://docs.github.com/en/developers/apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
   * /auth/github/callback
   *
   * @deprecated
   * @returns {Promise<any>}
   */
  async requestGithubUserIdentity() {
    const client_id = this.configService.getOrThrow<string>('GITHUB_CLIENT_ID');
    const redirect_uri = this.configService.getOrThrow<string>(
      'GITHUB_REDIRECT_URI',
    );
    const state = CryptoUtil.uuid().split('-').join('').substring(0, 6);

    // 5분간 유효하게 합니다 (CSRF 방지)
    // An unguessable random string. It is used to protect against cross-site request forgery attacks.
    await this.redisService.set2('github_state', state, 5);

    const scope = 'user:email';

    const URL = 'https://github.com/login/oauth/authorize?';

    const query = {
      client_id,
      redirect_uri,
      state,
      scope,
    } as Record<string, any>;

    const queryString = Object.keys(query)
      .map((key: string, index: number) => {
        if (index === 0) {
          return `${key}=${query[key]}`;
        }

        return `&${key}=${query[key]}`;
      })
      .join('');

    return URL + queryString;
  }

  /**
   * 깃허브 유저 데이터를 가져옵니다.
   *
   * @deprecated
   * @returns
   */
  async getGithubUserData({
    token_type,
    access_token,
  }: any): Promise<GithubUserData> {
    const axiosInstance = this.httpService.axiosRef;

    const res = await axiosInstance.get('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `${token_type} ${access_token}`,
      },
    });

    if (res.status !== 200) {
      throw new UnauthorizedException(
        '깃허브 서버에서 유저 데이터를 받아오지 못했습니다',
      );
    }

    const data = res.data as any;

    return data;
  }
}
