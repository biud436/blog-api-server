import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';

export const useCookieParser = (app: NestExpressApplication) =>
    app.use(cookieParser());
