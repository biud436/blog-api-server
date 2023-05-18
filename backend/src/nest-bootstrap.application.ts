/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    ClassSerializerInterceptor,
    Logger,
    ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ServerLog } from './common/libs/logger/ServerLog';
import * as path from 'path';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import winstonLogger from 'src/common/winston-config';
import helmet from 'helmet';
import * as session from 'express-session';
import * as passport from 'passport';
import { createClient } from 'redis';
import { getSwaggerLoginCheckMiddleware } from './common/middlewares/swagger.middleware';
import RedisStore from 'connect-redis';
import { EventEmitter } from 'events';
import { useGlobalPipes } from './common/middlewares/global-pipes.middleware';
import { useStaticImageFiles } from './common/middlewares/images.middleware';
import { useHelmet } from './common/middlewares/helmet.middleware';
import { useCookieParser } from './common/middlewares/cookie-parser.middleware';

export class NestBootstrapApplication extends EventEmitter {
    private static INSTANCE: NestBootstrapApplication;
    private static PORT = 3000;
    private static CONFIG: ConfigService;
    private static LOGGER: Logger = new Logger(NestBootstrapApplication.name);

    private _application: NestExpressApplication | null = null;

    private static readonly SWAGGER_GLOB = ['/docs', '/docs-json'];
    private static readonly DEFAULT_VIEW_ENGINE = 'hbs';

    private static readonly CORS_WHITELIST = [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:3000',
    ];
    private static readonly LOCAL_HOST = 'http://localhost:3000';
    private static readonly PRODUCTION_HOST: [string] = [
        'https://blog.biud436.com',
    ];

    private static readonly REDIS_HOST =
        process.platform === 'linux' ? 'redis' : 'localhost';
    private static readonly REDIS_PORT = 6379;

    private constructor() {
        super();
        this.on('ready', () => {
            this.prepare().start();
        });
        this.on('[debug]', (message: string) => {
            NestBootstrapApplication.LOGGER.verbose(message);
        });
    }

    get app(): NestExpressApplication | null {
        return this._application;
    }

    public prepare(): NestBootstrapApplication {
        process.on('uncaughtException', (err) => {
            ServerLog.error(err.stack);
        });
        process.on('unhandledRejection', (err) => {
            ServerLog.error((err as any).stack);
        });

        return this;
    }

    private getWorkingDirectory(target?: string): string {
        const CWD = process.cwd();

        return target ? path.join(CWD, target) : CWD;
    }

    private getDefaultViewEngine(): string {
        return NestBootstrapApplication.DEFAULT_VIEW_ENGINE;
    }

    /**
     * 서버 시작
     */
    public async start(): Promise<void> {
        if (this.isDelvelopment()) {
            this.emit('[debug]', '서버가 개발 모드에서 시작되었습니다');
        }

        this._application = await NestFactory.create<NestExpressApplication>(
            AppModule,
            {
                ...winstonLogger,
                logger: new Logger(), // chalk 버그 방지
            },
        );

        // Nest.js v8 버전에서는 "ConfigService"라고 하면 오류가 나니 다음과 같이 해야 한다.
        NestBootstrapApplication.CONFIG = <ConfigService>(
            await this._application.resolve<ConfigService>(ConfigService)
        );

        this.initWithMiddleware(this._application).useNginxProxy(); // 쿠키 (NGINX 프록시 설정)

        await this._application.listen(NestBootstrapApplication.PORT);
    }

    private useGlobalPipes = useGlobalPipes;
    private useStaticImageFiles = useStaticImageFiles;
    private useHelmet = useHelmet;
    private useCookieParser = useCookieParser;

    /**
     * 미들웨어를 초기화합니다.
     *
     * @param app {NestExpressApplication}
     * @returns
     */
    private initWithMiddleware(
        app: NestExpressApplication,
    ): NestBootstrapApplication {
        this.useGlobalPipes(app);
        this.useClassSerializerInterceptor(app);
        this.useStaticImageFiles(app);
        this.useHelmet(app);

        app.useStaticAssets(path.join(__dirname, '..', 'public'));
        app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
        app.setViewEngine(this.getDefaultViewEngine());

        this.useStickySession(app);
        this.useCookieParser(app);
        this.useCors(app);

        app.useGlobalGuards();

        this.useSwagger(app);

        this.emit('[debug]', '미들웨어를 초기화하였습니다');

        return this;
    }

    private useSwagger(app: NestExpressApplication) {
        const configService = NestBootstrapApplication.CONFIG;

        app.use(
            NestBootstrapApplication.SWAGGER_GLOB,
            getSwaggerLoginCheckMiddleware(configService),
        );
    }

    private useCors(app: NestExpressApplication) {
        const whitelist = this.isDelvelopment()
            ? NestBootstrapApplication.CORS_WHITELIST
            : [...NestBootstrapApplication.PRODUCTION_HOST];

        app.enableCors({
            origin: (origin, callback) => {
                if (!origin || whitelist.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        });
    }

    private useStickySession(
        app: NestExpressApplication,
    ): NestBootstrapApplication {
        const redisStoreMiddleware = createClient({
            socket: {
                host: NestBootstrapApplication.REDIS_HOST,
                port: NestBootstrapApplication.REDIS_PORT,
            },
            legacyMode: true,
        });

        redisStoreMiddleware.connect().catch(console.error);

        app.use(
            session({
                secret: NestBootstrapApplication.CONFIG.getOrThrow(
                    'APP_SECRET',
                ),
                resave: false,
                saveUninitialized: false,
                store: new RedisStore({ client: redisStoreMiddleware }),
                cookie: {
                    httpOnly: true,
                    signed: true,
                    sameSite: 'none',
                    secure: process.env.NODE_ENV === 'production',
                },
            }),
        );

        app.use(passport.initialize());
        app.use(passport.session());

        return this;
    }

    /**
     * class-transform을 전역적으로 수행합니다.
     * `@Exclude()` 데코레이터가 마킹된 속성이 자동으로 제외됩니다.
     *
     * @link https://wanago.io/2020/06/08/api-nestjs-serializing-response-interceptors/
     * @param app
     * @returns
     */
    private useClassSerializerInterceptor(app: NestExpressApplication) {
        app.useGlobalInterceptors(
            new ClassSerializerInterceptor(app.get(Reflector)),
        );
    }

    private useNginxProxy(): NestBootstrapApplication {
        // NGINX 내부에서 EXPRESS가 실행 중이기 때문에 이 옵션을 전달해야 합니다.
        // 그렇지 않으면 쿠키가 설정되지 않습니다.
        // https://expressjs.com/ko/guide/behind-proxies.html
        this._application?.set('trust proxy', 1);

        return this;
    }

    private getSwaggerConfigBuilder() {
        return new DocumentBuilder()
            .setTitle('블로그 서버의 API')
            .setDescription(
                [
                    `[블로그](https://blog.biud436.com)에서 사용되는 API 문서를 제공합니다.`,
                    '별도의 인증 없이 API 호출이 가능합니다.',
                ].join('<p></p>'),
            )
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            })
            .setContact('the developer', '', 'biud436@gmail.com')
            .addServer(NestBootstrapApplication.LOCAL_HOST, '로컬 서버')
            .addServer(NestBootstrapApplication.PRODUCTION_HOST[0], '배포 서버')
            .setVersion('1.0')
            .build();
    }

    private initWithApiDocs(): NestBootstrapApplication {
        const config = this.getSwaggerConfigBuilder();
        const document = SwaggerModule.createDocument(
            this._application!,
            config,
        );
        SwaggerModule.setup('docs', this._application!, document, {
            explorer: true,
            swaggerOptions: {
                defaultModelsExpandDepth: -1, // API 문서에서 하단 객체 제거
                persistAuthorization: true, // 새로고침 해도 로그인 고정
            },
            customfavIcon: '/favicon.png',
            customJs: '/js/swagger-ui-inject.js',
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
