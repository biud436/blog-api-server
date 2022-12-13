import * as toss from '@toss/nestjs-aop';
import { SlackLogger, SLACK_LOGGER_DECORATOR } from './slack.logger';

@toss.Aspect(SLACK_LOGGER_DECORATOR)
export class SlackDecorator implements toss.LazyDecorator<any, any> {
    /**
     * SlackLogger를 DI 받아서 슬랙으로 로그를 남깁니다.
     *
     * @param slackLogger
     */
    constructor(private readonly slackLogger: SlackLogger) {}

    wrap({ method, metadata: options }: toss.WrapParams<any, any>) {
        return (...args: any[]) => {
            try {
                const methodName: string = method.name;

                this.slackLogger.log(
                    `${methodName}: ${args.join(' ')}`,
                    `${method.name}`,
                );
            } catch (e) {
                console.warn(e);
            }
            return method(...args);
        };
    }
}
