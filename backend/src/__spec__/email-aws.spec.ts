import 'reflect-metadata';
import * as AWS from 'aws-sdk';
import { Container, Service } from 'typedi';
const dotenv = require('dotenv');

@Service()
class EmailService {
  async sendMail(client: AWS.SES, config: AWS.SES.SendEmailRequest) {
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

  get options(): AWS.SES.SendEmailRequest {
    // 한글 처리
    const base64ToName = Buffer.from(`관리자`).toString('base64');
    const finalToName = `=?UTF-8?B?${base64ToName}?= <${process.env.TO_EMAIL_ADDRESS}>`;

    const config = {
      Destination: {
        BccAddresses: [],
        CcAddresses: [],
        ToAddresses: [process.env.TO_EMAIL_ADDRESS],
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

describe('이메일 전송', () => {
  const emailService: EmailService = Container.get(EmailService);

  it('AWS SES로 메일 발송', async () => {
    const value = dotenv.config({ path: 'aws.env' });

    const client = new AWS.SES({
      region: 'ap-northeast-2',
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
      },
      apiVersion: '2012-10-17',
    });

    const config = emailService.options;

    const result = await emailService.sendMail(client, config);
    if (result) {
      expect(result).toBeTruthy();
    }
  });
});
