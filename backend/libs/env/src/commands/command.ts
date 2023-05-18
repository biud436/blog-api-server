import { ServerLog } from 'src/common/libs/logger/ServerLog';
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import {
    CommandImpl,
    IEnvFile,
    IEnvFileTypeMap,
    TerminalList,
} from '../tools/types';
import { getEnvFile } from '../tools/utility';
import { envFileBuilder } from '../tools/EnvFileBuilder';

export class Command implements CommandImpl {
    public env?: IEnvFile;
    private tempXORKey?: number;

    private flag = {
        isPort: false,
        isPassword: false,
    };

    constructor(private _name: string) {}

    async start() {
        return await inquirer.prompt([
            {
                name: 'type',
                type: 'list',
                message: '변경하고 싶은 .env의 값을 선택하세요',
                choices: [
                    ...Object.keys(TerminalList).map((e, i) => {
                        return `${i + 1}) ${e}`;
                    }),
                ],
            },
        ]);
    }

    getPromptType(key: IEnvFileTypeMap) {
        // 포트라면 숫자 타입으로 할당해야 합니다.
        const isPort = key.indexOf('PORT') >= 0;
        const isPassword = key.indexOf('PASSWORD') >= 0;

        this.flag.isPort = isPort;
        this.flag.isPassword = isPassword;

        // 타입을 결정합니다.
        const promptType: inquirer.QuestionTypeName = isPort
            ? 'number'
            : isPassword
            ? 'password'
            : 'input';

        return promptType;
    }

    async requestQuestion(
        key: IEnvFileTypeMap,
        promptType: 'number' | 'input' | 'password',
    ) {
        return await inquirer.prompt({
            name: key,
            type: promptType,
            message: `${key}의 값을 입력하세요`,
        });
    }

    /**
     * 실행할 내용
     * @param args
     */
    async execute(args?: string[]) {
        const anwsers = await this.start();
        const key = <IEnvFileTypeMap>anwsers.type;
        const promptType = this.getPromptType(key);

        const valueAnwsers = await this.requestQuestion(key, promptType);

        await this.flush(key, valueAnwsers);
    }

    async flush<T extends Record<string, any>>(
        key: IEnvFileTypeMap,
        valueAnwsers: T,
    ) {
        // 환경 설정 파일을 읽어옵니다.
        const env = getEnvFile.call(this);

        let value = valueAnwsers[key];
        const envFilePath = path.join(process.cwd(), '.env');

        // 값을 변경합니다.
        const realKey = key.split(' ')[1].trim();
        console.log('키 ' + realKey + '의 값을 변경합니다.');

        // 깊은 복사
        const tempEnv: Record<string, any> = {
            ...env,
        };

        console.log(env);

        // 토큰이 없을 때 새로 발급합니다.
        if (
            key.indexOf('JWT_SECRET') >= 0 ||
            key.indexOf('JWT_REFRESH_TOKEN_SECRET') >= 0 ||
            key.indexOf('PASSWORD_JWT_SECRET') >= 0
        ) {
            if (!value || value === '') {
                value = envFileBuilder.issueTokenSecret();
            }
        }

        // XOR 키가 있는지 확인합니다.
        if (key.indexOf('MAIL_XOR_KEY') >= 0) {
            if (!value || value === '') {
                this.tempXORKey = +value;
            }
        }

        if (!tempEnv[realKey]) {
            tempEnv[realKey] = value;
        }

        if (tempEnv[realKey]) {
            tempEnv[realKey] = value;

            const publicIP = value;
            tempEnv['PUBLIC_SERVER_IP'] = '[0]';

            let jsonToEnv = JSON.stringify(tempEnv, null, 0);
            jsonToEnv = jsonToEnv.replace(/[\{]+/gi, '');
            jsonToEnv = jsonToEnv.replace(/[\}]+/gi, '');
            jsonToEnv = jsonToEnv.replace(/[\:]+/gi, '=');
            jsonToEnv = jsonToEnv.replace(/[\n]+/gi, '');
            jsonToEnv = jsonToEnv.replace(/[\,]+/gi, '\r\n');
            jsonToEnv = jsonToEnv.replace(/[\"]+/gi, '');
            jsonToEnv = jsonToEnv.replace(/[\']+/gi, '');
            jsonToEnv = jsonToEnv.replace('[0]', publicIP);

            // Beautify를 적용하여 JSON 파일을 전개합니다.
            await fs.promises.writeFile(envFilePath, jsonToEnv, 'utf-8');

            console.log(
                `${realKey}의 값이 ${
                    this.flag.isPassword
                        ? (<string>value).replace(/[\w]/g, '*')
                        : value
                }으로 변경되었습니다.`,
            );
        }
    }
}
