import { Injectable } from '@nestjs/common';
import { MailForm, MailSender } from './mailSender';
import Mail from 'nodemailer/lib/mailer';

@Injectable()
export class MailService {
    constructor(private readonly mailSender: MailSender) {}

    /**
     * send the mail to certain email address.
     *
     * @param options {Mail.Options}
     */
    async send(options: Mail.Options) {
        this.mailSender.send(options);
    }

    async sendAsync(form: Mail.Options) {
        return await this.mailSender.sendAsync(form);
    }

    get options(): MailForm {
        return this.mailSender.mailOptions;
    }
}
