import {
    WinstonModule,
    utilities as nestWinstonModuleUtilities,
    NestLikeConsoleFormatOptions,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

/**
 * TODO: 설정 파일 yaml 등으로 분리 필요
 */
namespace WinstonConfig {
    export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';
    export const DEFAULT_DATETIME_FORMAT = `${DEFAULT_DATE_FORMAT} HH:mm:ss`;
    export const SERVER_PREFIX = `blog`;
    export const PRINT_OPTION: Pick<
        NestLikeConsoleFormatOptions,
        'prettyPrint'
    > = {
        prettyPrint: true,
    };
    export const MAX_SIZE = `20m`;
    export const MAX_FILES = `14d`;
    export const FILE_NAME_RULES = 'logs/%DATE%.log';
}

export default {
    logger: WinstonModule.createLogger({
        transports: [
            new winston.transports.DailyRotateFile({
                filename: WinstonConfig.FILE_NAME_RULES,
                datePattern: WinstonConfig.DEFAULT_DATE_FORMAT,
                zippedArchive: true,
                maxSize: WinstonConfig.MAX_SIZE,
                maxFiles: WinstonConfig.MAX_FILES,
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: WinstonConfig.DEFAULT_DATETIME_FORMAT,
                    }),
                    nestWinstonModuleUtilities.format.nestLike(
                        WinstonConfig.SERVER_PREFIX,
                        WinstonConfig.PRINT_OPTION,
                    ),
                    winston.format.uncolorize(),
                ),
            }),
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.timestamp({
                        format: WinstonConfig.DEFAULT_DATETIME_FORMAT,
                    }),
                    nestWinstonModuleUtilities.format.nestLike(
                        WinstonConfig.SERVER_PREFIX,
                        WinstonConfig.PRINT_OPTION,
                    ),
                ),
            }),
        ],
    }),
};
