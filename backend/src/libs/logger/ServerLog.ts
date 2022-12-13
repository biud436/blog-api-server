import * as chalk from 'chalk';
import { DateTimeUtil } from '../date/DateTimeUtil';

export namespace ServerLog {
    /**
     * @private
     * @returns
     */
    function now() {
        const now = DateTimeUtil.now().toString();
        return now;
    }

    export function info(message?: string, ...args: any[]): void {
        console.info(
            `${chalk.green('[SERVER INFO] - ')}${chalk.white(
                message,
            )} ${chalk.yellow(now())}`,
        );
    }

    export function error(message?: string, ...args: any[]): void {
        console.error(
            `${chalk.green('[SERVER ERROR] -')}${
                ' ' + chalk.white(message)
            } ${chalk.yellow(now())}`,
        );
    }
}
