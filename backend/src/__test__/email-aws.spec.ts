import 'reflect-metadata';
import * as AWS from 'aws-sdk';
import { Container, Service } from 'typedi';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

type KeyMapOfConfigService =
    | 'TO_EMAIL_ADDRESS'
    | 'ACCESS_KEY_ID'
    | 'SECRET_ACCESS_KEY';

@Service()
class ConfigService {
    constructor() {
        dotenv.config({ path: 'aws.env' });
    }

    get(key: KeyMapOfConfigService): string {
        return process.env[key];
    }
}

@Service()
class EmailService {
    private static CLIENT_INSTANCE?: AWS.SES;
    private configService: ConfigService = Container.get(ConfigService);

    async sendEmail(client: AWS.SES, config: AWS.SES.SendEmailRequest) {
        return new Promise((resolve, reject) => {
            client.sendEmail(config, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });
    }

    async createSMTPClient(): Promise<AWS.SES> {
        if (!EmailService.CLIENT_INSTANCE) {
            EmailService.CLIENT_INSTANCE = new AWS.SES({
                region: 'ap-northeast-2',
                credentials: {
                    accessKeyId: this.configService.get('ACCESS_KEY_ID'),
                    secretAccessKey:
                        this.configService.get('SECRET_ACCESS_KEY'),
                },
                apiVersion: '2012-10-17',
            });
        }
        return EmailService.CLIENT_INSTANCE;
    }

    get options(): AWS.SES.SendEmailRequest {
        // 한글 처리
        const base64ToName = Buffer.from(`관리자`).toString('base64');
        const finalToName = `=?UTF-8?B?${base64ToName}?= <${this.configService.get(
            'TO_EMAIL_ADDRESS',
        )}>`;

        const config = {
            Destination: {
                BccAddresses: [],
                CcAddresses: [],
                ToAddresses: [this.configService.get('TO_EMAIL_ADDRESS')],
            },
            Message: {
                Body: {
                    Html: {
                        Charset: 'UTF-8',
                        Data: `<html>
                        <head></head>
                        <body>
                          <h1>안녕하세요</h1>
                          <p>테스트 이메일을 보냅니다.</p>
                        </body>
                        </html>`,
                    },
                    Text: {
                        Charset: 'UTF-8',
                        Data: '안녕하세요. 테스트 이메일입니다.',
                    },
                },
                Subject: {
                    Charset: 'EUC-KR',
                    Data: '테스트 이메일입니다.',
                },
            },
            Source: finalToName /* required */,
        };

        return config;
    }
}

@Service()
class EmailController {
    private emailService: EmailService = Container.get(EmailService);

    async sendEmail() {
        const client = await this.emailService.createSMTPClient();
        const config = this.emailService.options;
        const result = await this.emailService.sendEmail(client, config);
        console.log(result);

        return result;
    }
}

describe('이메일 전송', () => {
    const emailController: EmailController = Container.get(EmailController);

    it('AWS SES로 메일 발송', async () => {
        const result = await emailController.sendEmail();
        if (result) {
            expect(result).toBeTruthy();
        }
    });
});
