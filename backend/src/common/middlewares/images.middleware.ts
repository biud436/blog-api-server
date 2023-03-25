import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

const PRODUCTION_IMAGE_PATH = '/usr/src/app/upload/';
const LOCAL_IMAGE_PATH = './images';

export function useStaticImageFiles(app: NestExpressApplication) {
    return app.use(
        '/images',
        express.static(
            process.env.NODE_ENV === 'production'
                ? PRODUCTION_IMAGE_PATH
                : LOCAL_IMAGE_PATH,
        ),
    );
}
