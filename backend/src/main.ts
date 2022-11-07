import { Logger, ValidationPipe } from '@nestjs/common';
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
import winstonLogger from 'src/common/winston-config';
import helmet from 'helmet';
import * as session from 'express-session';
import * as passport from 'passport';
import * as mysqlSession from 'express-mysql-session';
import * as connectRedis from 'connect-redis';
import { createClient } from 'redis';

const MySQLStore = mysqlSession(session);
const RedisStore = connectRedis(session);

export class NestBootstrapApplication {
    private static INSTANCE: NestBootstrapApplication;
    private static PORT = 3000;
    private static CONFIG: ConfigService;
    private static LOGGER: Logger = new Logger(NestBootstrapApplication.name);

    private _application: NestExpressApplication = null;

    get app() {
        return this._application;
    }

    /**
     * 서버 시작
     */
    async start(): Promise<void> {
        if (this.isDelvelopment()) {
            NestBootstrapApplication.LOGGER.log(
                '서버가 개발 모드에서 시작되었습니다',
            );
        }

        console.log('어플리케이션 초기화 중');
        this._application = await NestFactory.create<NestExpressApplication>(
            AppModule,
            {
                ...winstonLogger,
            },
        );
        console.log('어플리케이션 초기화 완료');

        // Nest.js v8 버전에서는 "ConfigService"라고 하면 오류가 나니 다음과 같이 해야 한다.
        NestBootstrapApplication.CONFIG = <ConfigService>(
            await this._application.resolve<ConfigService>(ConfigService)
        );

        console.log(NestBootstrapApplication.CONFIG.get('DB_HOST'));

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
                disableErrorMessages: false,
                transform: true,
                transformOptions: {
                    enableImplicitConversion: true,
                },
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
        app.use(helmet());
        app.useStaticAssets(path.join(__dirname, '..', 'public'));
        app.setBaseViewsDir(path.join(__dirname, '..', 'views'));
        app.setViewEngine('hbs');

        // app.use(
        //     cookieParser(NestBootstrapApplication.CONFIG.get('APP_SECRET')),
        // );
        app.use(cookieParser());

        const redisStoreMiddleware = createClient({
            socket: {
                host: process.platform === 'linux' ? 'redis' : 'localhost',
                port: 6379,
            },
            legacyMode: true,
        });

        redisStoreMiddleware.connect().catch(console.error);

        app.use(
            session({
                secret: NestBootstrapApplication.CONFIG.get('APP_SECRET'),
                resave: false,
                saveUninitialized: false,
                // store: new session.MemoryStore(),
                store: new RedisStore({ client: redisStoreMiddleware }),
                // store: new MySQLStore({
                //     host: NestBootstrapApplication.CONFIG.get('DB_HOST'),
                //     port: NestBootstrapApplication.CONFIG.get('DB_PORT'),
                //     user: NestBootstrapApplication.CONFIG.get('DB_USER'),
                //     password:
                //         NestBootstrapApplication.CONFIG.get('DB_PASSWORD'),
                //     database:
                //         NestBootstrapApplication.CONFIG.get('DB_SESSION_NAME'),
                // }),
                cookie: {
                    httpOnly: true,
                    signed: true,
                    sameSite: 'strict',
                    secure: process.env.NODE_ENV === 'production',
                },
            }),
        );

        app.use(passport.initialize());
        app.use(passport.session());

        // app.enableCors({
        //     origin: [
        //         'https://blog.biud436.com',
        //         'http://localhost:3000',
        //         'http://localhost:8080',
        //     ],
        //     credentials: true,
        // });
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
            .setDescription(
                [
                    `회원 가입과 로그인 이후 우측 상단에서 <code>Access Token</code>을 설정해주십시오`,
                ].join('<p></p>'),
            )
            .addBearerAuth({
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            })
            .setContact('the developer', null, 'biud436@gmail.com')
            .addServer(
                this.isDelvelopment()
                    ? 'http://localhost:3000'
                    : 'https://blog-api.biud436.com',
                this.isDelvelopment() ? '로컬 서버' : '운영 서버',
            )
            .setVersion('1.0')
            .build();

        const document = SwaggerModule.createDocument(
            this._application,
            config,
        );
        SwaggerModule.setup('docs', this._application, document, {
            explorer: true, // 동적 로드 설정
            swaggerOptions: { persistAuthorization: true },
            customfavIcon: '/favicon.png',
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
