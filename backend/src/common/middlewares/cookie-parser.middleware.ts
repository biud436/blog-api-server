import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';

export const useCookieParser = (app: NestExpressApplication) =>
    app.use(cookieParser());
