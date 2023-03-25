import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

export function useGlobalPipes(app: NestExpressApplication) {
    app.useGlobalPipes(
        new ValidationPipe({
            disableErrorMessages: false,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );
}
