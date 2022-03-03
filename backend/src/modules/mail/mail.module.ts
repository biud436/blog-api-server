import { Module } from '@nestjs/common';
import { MailService } from './mail.service';

import { ConfigModule } from '@nestjs/config';
import { MailSender } from './mailSender';

@Module({
  imports: [ConfigModule],
  providers: [MailService, MailSender],
  exports: [MailService],
})
export class MailModule {}
