import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

import { ConfigModule } from '@nestjs/config';
import { MailSender } from './mailSender';

@Module({
    imports: [ConfigModule],
    providers: [MailService, MailSender],
    exports: [MailService],
})
export class MailModule {
    // 동적 모듈로 만드는 방법도 있다.
}
