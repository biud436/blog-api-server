import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import Mail from 'nodemailer/lib/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

export type MailForm = Record<string, SMTPTransport.Options>;
export type MailAdminFrom<T extends MailForm, VP extends keyof T> = {
    from: T[VP]['from'];
};
export type MailOptions = Pick<
    Mail.Options,
    'from' | 'to' | 'subject' | 'text' | 'html'
>;

namespace MailSenderCollection {
    export interface MailSenderForm {
        from: string;
        to: string;
        subject: string;
        html: string;
    }

    /**
     * @class MailFormValidator
     * @description
     * 메일 폼의 유효성을 검사하는 클래스 입니다.
     */
    class MailFormValidator {
        handle(form: MailOptions) {
            if (!form.from) {
                throw new Error('from이 없습니다.');
            }

            if (!form.to) {
                throw new Error('to가 없습니다.');
            }

            if (!form.subject) {
                throw new Error('subject가 없습니다.');
            }

            if (!form.html) {
                throw new Error('text 또는 html 파일이 없습니다.');
            }
        }
    }

    const validator = new MailFormValidator();

    export const validate = (form: Mail.Options) => {
        validator.handle(form);
    };
}

/**
 * @description
 * 이 클래스는 SMTP를 이용하여 서버측에서 메일을 보낼 수 있게 합니다.
 * 다른 서비스로는 AWS Simple Mail Service가 있습니다.
 */
@Injectable()
export class MailSender {
    private transporterOptions: MailForm;

    private options: SMTPTransport.Options;
    private transporter?: Mail;

    constructor(private readonly configService: ConfigService) {
        this.initWithMailInfo();
        this.transporter = nodemailer.createTransport(
            this.transporterOptions.gmail,
        );
        if (!this.transporter) {
            throw new Error('메일이 생성되지 않았습니다.');
        }
    }

    /**
     * XOR 난독화 함수입니다. (회전 없음)
     *
     * @param str
     * @returns
     */
    decrypt(str: string): string {
        const XOR_KEY = +this.configService.get<number>('MAIL_XOR_KEY');

        return str
            .split('')
            .map((i) => i.charCodeAt(0) ^ XOR_KEY)
            .map((i) => String.fromCharCode(i))
            .join('');
    }

    /**
     * 메일 정보를 생성합니다.
     */
    initWithMailInfo(): void {
        const get = (key: string) => {
            return this.configService.get(key);
        };

        this.transporterOptions = {
            // 처리 속도 빠름 (대량 메일 발송 등의 제한 없이, 하루에 100통 제한)
            gmail: {
                service: 'gmail',
                host: 'smtp.gmail.com',
                auth: {
                    user: get('GMAIL_USERNAME'),
                    pass: this.decrypt(get('GMAIL_PASSWORD')),
                },
            },
            // 처리 속도 엄청 느림
            // 짧은 시간에 메일을 대량으로 발송할 경우, SMTP 서버에서 처리가 늦음.
            daum: {
                service: 'daum',
                host: 'smtp.daum.net',
                port: 465,
                auth: {
                    user: get('DAUM_USERNAME'),
                    pass: this.decrypt(get('DAUM_PASSWORD')),
                },
            },
            // 500 통 이하 (발송 서버 평판 시스템 운영으로 다량으로 보내면
            // 해당 서버의 IP 평판을 저하시킵니다)
            naver: {
                service: 'naver',
                host: 'smtp.naver.com',
                port: 465,
                auth: {
                    user: get('NAVER_USERNAME'),
                    pass: this.decrypt(get('NAVER_PASSWORD')),
                },
            },
        };
    }

    get mailOptions(): MailForm {
        return this.transporterOptions;
    }

    /**
     * 메일을 비동기로 전송합니다.
     *
     * @param form
     */
    send(form: Mail.Options) {
        const { options, transporter } = this;

        MailSenderCollection.validate(form);

        transporter.sendMail(form, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email send: ' + info.response);
            }
        });
    }

    /**
     * 메일을 비동기로 전송합니다 (Promise)
     * @param form
     * @returns
     */
    sendAsync(form: Mail.Options): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const { options, transporter } = this;

            MailSenderCollection.validate(form);

            transporter.sendMail(form, (error, info) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve('Email send: ' + info.response);
            });
        });
    }
}
