import * as toss from '@toss/nestjs-aop';
import { SlackLogger, SLACK_LOGGER_DECORATOR } from './slack.logger';

/**
 * @toss.Aspect는 Injectable 데코레이터와 조합되어있기 때문에 Provider와 같습니다.
 * Injectable 데코레이터를 포함하므로 IOC 컨테이너에 의해 DI를 받을 수 있습니다.
 *
 * 이름과 달리 Injetable하며 기능을 정의하기 때문에, 순수한 데코레이터와는 구분됩니다.
 * 따라서 decorators 폴더로 옮기지 마시기 바랍니다.
 *
 * 클래스명은 튜토리얼에 근거하여 이름을 명명했으나 순수 데코레이터와 혼동을 줄 가능성이 있기 때문에,
 * 적당한 이름으로 변경할 생각입니다.
 *
 * 이 클래스는 SlackModule에 Provider로 등록해야 합니다.
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
