import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ServerLog } from './utils/ServerLog';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as basicAuth from 'express-basic-auth';
import * as express from 'express';

export class NestBootstrapApplication {
  private static INSTANCE: NestBootstrapApplication;
  private static PORT: number = 3000;
  private static CONFIG: ConfigService;

  private _application: NestExpressApplication = null;

  get app() {
    return this._application;
  }

  /**
   * 서버 시작
   */
  async start(): Promise<void> {
    if (this.isDelvelopment()) {
      ServerLog.info('서버가 개발 모드에서 시작되었습니다');
    }

    this._application = await NestFactory.create<NestExpressApplication>(
      AppModule,
    );

    NestBootstrapApplication.CONFIG = <ConfigService>(
      this._application.get('ConfigService')
    );

    this.initWithMiddleware(this._application)
      .initWithApiDocs() // API 문서 설정
      .useNginxProxy(); // 쿠키 (NGINX 프록시 설정)

    await this._application.listen(NestBootstrapApplication.PORT);
  }

  /**
   * 미들웨어를 초기화합니다.
   *
   * @param app {NestExpressApplication}
   * @returns
   */
  private initWithMiddleware(
    app: NestExpressApplication,
  ): NestBootstrapApplication {
    app.useGlobalPipes(
      new ValidationPipe({
        dismissDefaultMessages: false,
      }),
    );
    app.use(
      '/images',
      express.static(
        process.env.NODE_ENV === 'production'
          ? '/usr/src/app/upload/'
          : './images',
      ),
    );
    app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
    app.useStaticAssets(path.join(__dirname, '..', 'public'));
    app.setViewEngine('hbs');

    app.use(cookieParser());
    app.enableCors();
    app.useGlobalGuards();

    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          admin: NestBootstrapApplication.CONFIG.get('DOCS_PASSWORD'),
        },
      }),
    );

    ServerLog.info('미들웨어를 초기화하였습니다');

    return this;
  }

  private useNginxProxy(): NestBootstrapApplication {
    // NGINX 내부에서 EXPRESS가 실행 중이기 때문에 이 옵션을 전달해야 합니다.
    // 그렇지 않으면 쿠키가 설정되지 않습니다.
    // https://expressjs.com/ko/guide/behind-proxies.html
    this._application.set('trust proxy', 1);

    return this;
  }

  private initWithApiDocs(): NestBootstrapApplication {
    const config = new DocumentBuilder()
      .setTitle('블로그 서버의 API')
      .setDescription('블로그 서버에서 제공하는 문서입니다.')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      })
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(this._application, config);
    SwaggerModule.setup('docs', this._application, document, {
      // API 문서에서 하단 객체 제거
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    });

    return this;
  }

  private isDelvelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  public static getInstance() {
    if (!NestBootstrapApplication.INSTANCE) {
      NestBootstrapApplication.INSTANCE = new NestBootstrapApplication();
    }
    return NestBootstrapApplication.INSTANCE;
  }
}

process.on('uncaughtException', (err) => {
  ServerLog.error(err.stack);
});
process.on('unhandledRejection', (err) => {
  ServerLog.error((err as any).stack);
});

NestBootstrapApplication.getInstance().start();
