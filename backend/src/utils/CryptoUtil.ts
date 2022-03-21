import * as crypto from 'crypto';
import * as zlib from 'zlib';
import { v4 as uuidv4 } from 'uuid';

export namespace CryptoUtil {
  // const iv = crypto.randomBytes(16);

  /**
   * 램덤한 문자열을 만듭니다.
   *
   * @param length
   * @returns
   */
  export function getRandomString(length: number): string {
    let text = '';
    let possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * 램덤한 숫자값을 형성합니다.
   * @param length
   * @returns
   */
  export function getRandomNumber(length: number): number {
    let text = '';
    let possible = '0123456789';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return parseInt(text);
  }

  /**
   * 램덤한 바이트 값을 만듭니다.
   * @param length
   * @returns
   */
  export function randomeBytes(length: number): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * 램덤한 16진수 문자열을 만듭니다.
   * @param length
   * @returns
   */
  export function getRandomHexString(length: number): string {
    let text = '';
    let possible = '0123456789abcdef';
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * sha1을 이용하여 해시를 생성합니다.
   *
   * @param str
   * @returns
   */
  export function sha1(str: string): string {
    return crypto.createHash('sha1').update(str).digest('hex');
  }

  /**
   * sha256을 이용하여 해시를 생성합니다.
   *
   * @param str
   * @returns
   */
  export function sha256(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }

  /**
   * sha512을 이용하여 해시를 생성합니다.
   *
   * @param str
   * @returns
   */
  export function sha512(str: string): string {
    return crypto.createHash('sha512').update(str).digest('hex');
  }

  /**
   * md5을 이용하여 해시를 생성합니다.
   *
   * @param str
   * @returns
   */
  export function md5(str: string): string {
    return crypto.createHash('md5').update(str).digest('hex');
  }

  export async function compress(text: string): Promise<any> {
    const zlibProc = new Promise((resolve, reject) => {
      zlib.deflate(text, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    return await zlibProc;
  }

  export function uuidv4(): string {
    return <string>uuidv4();
  }
}
