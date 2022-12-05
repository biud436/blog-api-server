import { Request, Response, NextFunction } from 'express';
import { NestBootstrapApplication } from 'src/main';
import * as basicAuth from 'express-basic-auth';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

export function getSwaggerAuthMiddleware(configService: ConfigService) {
    return basicAuth({
        challenge: true,
        users: {
            admin: configService.get('DOCS_PASSWORD'),
        },
    });
}

export function getSwaggerLoginCheckMiddleware(configService: ConfigService) {
    return (req: Request, res: Response, next: NextFunction) => {
        const accessToken = req.cookies['access_token'];

        jwt.verify(accessToken, configService.get('JWT_SECRET'), (err) => {
            if (err) {
                res.clearCookie('access_token');
                res.render('login', (err, html) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.send(html);
                    }
                });
            } else {
                next();
            }
        });
    };
}
