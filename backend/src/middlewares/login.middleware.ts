import { NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export class LoginMiddleware implements NestMiddleware {
    constructor(private readonly configService: ConfigService) {}

    use(req: Request, res: Response, next: NextFunction) {
        // check cookie with access token
        // if cookie is not valid, redirect to login page
        // if cookie is valid, redirect to main page
        // if cookie is valid, but access token is not valid, redirect to login page

        const accessToken = req.cookies['access_token'];
        console.log('accessToken: ' + accessToken);
        if (!accessToken) {
            res.redirect('/login', 302);
            return;
        }

        const secret = this.configService.get('JWT_SECRET');

        jwt.verify(accessToken, secret, (err, decoded) => {
            if (err) {
                res.status(401).send('Unauthorized');
                return;
            }
            next();
        });
    }
}
