import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

export function useHelmet(app: NestExpressApplication) {
    app.use(helmet());
}
