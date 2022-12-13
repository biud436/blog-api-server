import * as toss from '@toss/nestjs-aop';
import { SlackLogger, SLACK_LOGGER_DECORATOR } from './slack.logger';

/**
 * IOC 컨테이너에 의해 DI를 받아야 하기 때문에 SlackModule에 Provider로 등록해야 합니다.
 * decorators 폴더로 옮기지 마십시오.
 */
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
