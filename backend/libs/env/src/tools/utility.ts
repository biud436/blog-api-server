import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Command } from '../commands/command';
import { IEnvFile } from './types';

/**
 * 환경 변수 파일의 내용을 읽어옵니다.
 * @private
 * @returns
 */
export function getEnvFile(this: Command) {
  if (this.env) {
    return this.env;
  }

  // 환경 설정 파일은 lazy하게 로딩될 수 있습니다.
  const envFile = dotenv.parse(fs.readFileSync('.env', 'utf8'));
  this.env = <IEnvFile>(<unknown>envFile);

  return this.env;
}

/**
 * XOR 난독화 함수입니다. (회전 없음)
 *
 * @param str
 * @returns
 */
export function encrypt(str: string, XOR_KEY: number): string {
  return str
    .split('')
    .map((i) => i.charCodeAt(0) ^ XOR_KEY)
    .map((i) => String.fromCharCode(i))
    .join('');
}
