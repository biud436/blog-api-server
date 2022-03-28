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
  @CustomApiOkResponse({
    operation: {
      summary: '로그인',
      description: '로그인을 처리합니다.',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
    },
    description: '로그인 성공시 토큰을 반환합니다.',
    basicAuth: true,
  })
  async login(
    @Req() req: Request,
    @Res({
      passthrough: true,
    })
    res: Response,
  ) {
    try {
      this.logger.log('로그인 시도');

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
  @CustomApiOkResponse({
    operation: {
      summary: '이메일로 인증 코드 전송',
      description: '이메일로 인증 코드 6자리를 전송합니다.',
    },
    description: '이메일로 인증 코드 6자리를 전송합니다.',
    auth: false,
  })
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
  @CustomApiOkResponse({
    operation: {
      summary: '인증 코드 확인',
      description: '인증 코드를 확인합니다.',
    },
    description: '인증 코드를 확인합니다.',
    auth: false,
  })
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
  @CustomApiOkResponse({
    operation: {
      summary: '회원가입',
      description: '회원가입을 처리합니다.',
    },
    description: '회원가입을 처리합니다.',
    auth: false,
  })
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
