import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { Response } from 'express';
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

const CONFIG = {
  KOREAN: {
    NOTIFY_ERROR_PASSWORD:
      '비밀번호는 8자리 이상, 하나 이상의 소문자, 그리고 숫자와 특수문자가 있어야 합니다.',
    NOTIFY_ERROR_EMAIL: '이메일 형식이 올바르지 않습니다.',
    NOTIFY_ERROR_ALREADY_EXIST_EMAIL: '이미 존재하는 이메일입니다.',
    NOTIFY_ERROR_SAVE_PROFILE:
      '프로필 정보를 저장하는 도중에 오류가 발생하였습니다.',
    NOTIFY_FAILED_SIGNUP: '회원 가입에 실패하였습니다.',
    NOTIFY_ERROR_AUTH_CODE: '인증 코드가 잘못되었거나 만료되었습니다.',
    AUTH_CODE_EMAIL_TITLE: `인증 코드를 보내드립니다.`,
    AUTH_CODE_EMAIl_CONTENT: `인증 코드는 {0}입니다.`,
  },
};

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private connection: Connection,
  ) {}

  async login(user: any) {
    const payload = <JwtPayload>{ user: user, role: 'user' };
    let isAdmin = false;

    if ('username' in user) {
      isAdmin = await this.adminService.isAdmin(user.username);
    }

    if (isAdmin) {
      payload.role = 'admin';
    }

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, <
      JwtSignOptions
    >{
      secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
      signOptions: {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
        algorithm: 'HS384',
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async vertifyAsync(
    token: string,
    options?: JwtVerifyOptions,
  ): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token, options);
  }

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
      const isValidEmail = await this.profileService.isValidEmail(body.email);
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
      const profileModel = await this.profileService.addProfile(profileDto);

      if (!profileModel) {
        throw new DownStreamInternalServerErrorException(
          CONFIG.KOREAN.NOTIFY_ERROR_SAVE_PROFILE,
        );
      }

      // 유저 모델을 저장합니다.
      const userModel = await this.userService.create(userDto, profileModel);

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

      // 레디스에 저장된 키를 제거합니다.
      const deletedOK = await this.redisService.del(KEY);
      console.log(deletedOK);

      return {
        user: safelyUserModel,
        profile: profileModel,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
