import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { CustomApiOkResponse } from 'src/decorators/custom.decorator';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { ChronoUnit, TemporalField, TemporalUnit } from '@js-joda/core';

@Controller('auth')
export class AuthController {
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
  async login(@Req() req: Request, @Res() res: Response): Promise<void> {
    const token = await this.authService.login(req.user);

    let url = this.configService.get('PUBLIC_SERVER_IP');
    url = url.replace('http://', '');
    url = url.replace('https://', '');
    url = url.split(':')[0];

    let jwtSecretExpirationTime = DateTimeUtil.extractJwtExpirationTime(
      this.configService.get('JWT_SECRET_EXPIRATION_TIME'),
    );
    let jwtRefreshTokenExpirationTime = DateTimeUtil.extractJwtExpirationTime(
      this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME'),
    );

    res
      .cookie('access_token', token.accessToken, {
        httpOnly: true,
        domain: url,
        expires: DateTimeUtil.toDate(jwtSecretExpirationTime),
      })
      .cookie('refresh_token', token.refreshToken, {
        httpOnly: true,
        domain: url,
        expires: DateTimeUtil.toDate(jwtRefreshTokenExpirationTime),
      })
      .send({ success: true });
  }
}
