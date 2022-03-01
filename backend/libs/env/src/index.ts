import chalk from 'chalk';
import { ServerLog } from 'src/utils/ServerLog';
import { CryptoUtil } from 'src/utils/CryptoUtil';
import * as fs from 'fs';
import * as inquirer from 'inquirer';
import * as dotenv from 'dotenv';
import * as path from 'path';

export * from './libs/env.module';
export * from './libs/env.service';

export namespace EnvModuleEntryPoint {
  /**
   * @public
   */
  export enum TerminalList {
    DB_HOST = '1) DB_HOST',
    DB_PASSWORD = '2) DB_PASSWORD',
    DB_USER = '3) DB_USER',
    DB_NAME = '4) DB_NAME',
    DB_PORT = '5) DB_PORT',
    DOCS_USERNAME = '6) DOCS_USERNAME',
    DOCS_PASSWORD = '7) DOCS_PASSWORD',
    JWT_SECRET = '8) JWT_SECRET',
    JWT_SECRET_EXPIRATION_TIME = '9) JWT_SECRET_EXPIRATION_TIME',
    JWT_REFRESH_TOKEN_SECRET = '10) JWT_REFRESH_TOKEN_SECRET',
    JWT_REFRESH_TOKEN_EXPIRATION_TIME = '11) JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    PUBLIC_SERVER_IP = '12) PUBLIC_SERVER_IP',
    PASSWORD_JWT_SECRET = '13) PASSWORD_JWT_SECRET',
  }

  /**
   * @private
   * @interface IEnvFile
   */
  interface IEnvFile {
    DB_HOST: string;
    DB_PASSWORD: string;
    DB_USER: string;
    DB_NAME: string;
    DB_PORT: string;
    HARVEN_DOCS_USERNAME: string;
    HARVEN_DOCS_PASSWORD: string;
    JWT_SECRET: string;
    JWT_SECRET_EXPIRATION_TIME: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
    PUBLIC_SERVER_IP: string;
    PASSWORD_JWT_SECRET: string;
  }

  type IEnvFileTypeMap = keyof IEnvFile;
  type TerminalListTypeMap = keyof TerminalList;

  /**
   * @private
   * @class EnvFileBuilder
   */
  class EnvFileBuilder {
    /**
     * 액세스 토큰의 비밀번호(secret)를 새로 발급합니다.
     * @returns
     */
    public issueTokenSecret() {
      const secret = this.generateSecret();
      return secret;
    }

    /**
     * 새로고침 토큰의 비밀번호(secret)를 새로 발급합니다.
     * @returns
     */
    public issueRefreshTokenSecret() {
      const secret = this.generateSecret();
      return secret;
    }

    private generateSecret() {
      return CryptoUtil.getRandomHexString(32);
    }
  }

  /** @public */
  export const envFileBuilder = new EnvFileBuilder();

  /**
   * @public
   * @class TerminalHelper
   */
  export class TerminalHelper {
    private env?: IEnvFile;

    /**
     * 터미널 헬퍼를 시작합니다.
     */
    public start() {
      // 환경 설정 파일을 읽어옵니다.
      const env = this.getEnvFile();
      console.log(env);

      inquirer
        .prompt([
          {
            name: 'type',
            type: 'list',
            message: '변경하고 싶은 .env의 값을 선택하세요',
            choices: [
              TerminalList.DB_HOST,
              TerminalList.DB_PASSWORD,
              TerminalList.DB_USER,
              TerminalList.DB_NAME,
              TerminalList.DB_PORT,
              TerminalList.DOCS_USERNAME,
              TerminalList.DOCS_PASSWORD,
              TerminalList.JWT_SECRET,
              TerminalList.JWT_SECRET_EXPIRATION_TIME,
              TerminalList.JWT_REFRESH_TOKEN_SECRET,
              TerminalList.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
              TerminalList.PUBLIC_SERVER_IP,
              TerminalList.PASSWORD_JWT_SECRET,
            ],
          },
        ])
        .then(async (anwsers) => {
          const key = <IEnvFileTypeMap>anwsers.type;

          // 포트라면 숫자 타입으로 할당해야 합니다.
          const isPort = key.indexOf('PORT') >= 0;

          // 비밀번호 타입이라면 비밀번호가 보이지 않게 설정해야 합니다.
          const isPassword = key.indexOf('PASSWORD') >= 0;

          // 타입을 결정합니다.
          let promptType: inquirer.QuestionTypeName = isPort
            ? 'number'
            : isPassword
            ? 'password'
            : 'input';

          // ! 값을 입력 받기 위해 사용할 질문을 설정합니다.
          const valueAnwsers = await inquirer.prompt({
            name: key,
            type: promptType,
            message: `${key}의 값을 입력하세요`,
          });

          let value = valueAnwsers[key];

          const envFilePath = path.join(process.cwd(), '.env');

          // 값을 변경합니다.
          const realKey = key.split(' ')[1].trim();
          console.log('키 ' + realKey + '의 값을 변경합니다.');

          // 깊은 복사
          let tempEnv = {
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
                isPassword ? (<string>value).replace(/[\w]/g, '*') : value
              }으로 변경되었습니다.`,
            );
          }
        })
        .catch((err) => {
          console.warn(err);
        })
        .finally(() => {
          console.log('처리가 완료되었습니다');
        });
    }

    /**
     * 환경 변수 파일의 내용을 읽어옵니다.
     * @private
     * @returns
     */
    private getEnvFile() {
      if (this.env) {
        return this.env;
      }

      // 환경 설정 파일은 lazy하게 로딩될 수 있습니다.
      const envFile = dotenv.parse(fs.readFileSync('.env', 'utf8'));
      this.env = <IEnvFile>(<unknown>envFile);

      return this.env;
    }
  }

  export function start() {
    ServerLog.info('EnvModuleEntryPoint');
    const helper = new TerminalHelper();
    helper.start();
  }

  /**
   * backend 서버가 도커 내부에 있는지 확인합니다.
   * 통상적으로 도커 컨테이너 내부 환경의 경우에는 .dockerenv라는 파일이 존재합니다.
   *
   * @returns
   */
  export function isInsideDocker() {
    let isDockerInside = false;
    isDockerInside = fs.existsSync('/.dockerenv');

    // ! /proc/self/cgroup에 docker라는 단어가 있는지 체크합니다
    if (!isDockerInside) {
      const isExistedCGroup = fs.existsSync('/proc/self/cgroup');
      if (isExistedCGroup) {
        const cGroup = fs.readFileSync('/proc/self/cgroup', 'utf8');
        isDockerInside = cGroup.indexOf('docker') >= 0;
      }
    }

    return isDockerInside;
  }
}

EnvModuleEntryPoint.start();
