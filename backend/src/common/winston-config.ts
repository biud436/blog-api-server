import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export default {
  logger: WinstonModule.createLogger({
    transports: [
      new winston.transports.DailyRotateFile({
        filename: 'logs/%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          nestWinstonModuleUtilities.format.nestLike('blog', {
            prettyPrint: true,
          }),
          winston.format.uncolorize(),
        ),
      }),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
          }),
          nestWinstonModuleUtilities.format.nestLike('blog', {
            prettyPrint: true,
          }),
        ),
      }),
    ],
  }),
};
