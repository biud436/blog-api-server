import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, Optional, SetMetadata } from '@nestjs/common';

const LOGGER_NAME = 'SlackLogger';
export const SLACK_LOGGER_DECORATOR = Symbol('SLACK_LOGGER_DECORATOR');

export const SlackHook = (options: Record<string, any>) =>
    SetMetadata(SLACK_LOGGER_DECORATOR, options);

@Injectable()
export class SlackLogger extends Logger {
    private readonly _webhookUrl: string = process.env.SLACK_WEBHOOK_URL;

    constructor(@Optional() private readonly httpService: HttpService) {
        super(LOGGER_NAME);
    }

    log(message: any, context?: string): void {
        super.log(message, context);

        const { _webhookUrl: WEBHOOK_URL } = this;

        this.httpService.axiosRef.post(WEBHOOK_URL, {
            text: message,
        });
    }
}
