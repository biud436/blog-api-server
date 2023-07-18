import { Request, Response, NextFunction } from 'express';
import basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import { NestBootstrapApplication } from 'src/nest-bootstrap.application';

/**
 * [HTTP-Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)을 이용하는 Middleware입니다.
 * @param configService
 * @returns
 */
export function getSwaggerAuthMiddleware(configService: ConfigService) {
    /**
     * Nest.js의 Global Functional Middleware는 전역 DI가 되지 않으므로 외부에서 직접 주입해야 합니다.
     * 따라서 HOC(고차 컴포넌트) 기법을 이용하여 외부에서 ConfigService를 주입하였습니다.
     */
    return basicAuth({
        challenge: true,
        users: {
            admin: configService.getOrThrow('DOCS_PASSWORD'),
        },
    });
}

/**
 * Server의 Login API를 이용하여 **JWT Authorization**을 수행하는 Swagger Global Functional Middleware입니다.
 *
 * @param configService
 * @returns
 */
export function getSwaggerLoginCheckMiddleware(configService: ConfigService) {
    /**
     * Nest.js의 Global Functional Middleware는 전역 DI가 되지 않으므로 외부에서 직접 주입해야 합니다.
     * 따라서 HOC(고차 컴포넌트) 기법을 이용하여 외부에서 ConfigService를 주입하였습니다.
     */
    return (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.cookies['access_token'];

        jwt.verify(
            accessToken,
            configService.getOrThrow('JWT_SECRET'),
            (err: any) => {
                if (err) {
                    res.clearCookie('access_token');
                    res.render('login', (err: any, html: any) => {
                        if (err) {
                            console.error(err);
                            res.status(500).send(
                                '로그인 페이지에 접근할 수 없습니다.',
                            );
                        } else {
                            res.send(html);
                        }
                    });
                } else {
                    next();
                }
            },
        );
    };
}
