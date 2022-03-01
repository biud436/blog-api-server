import * as redis from 'redis';
import { promisify, format } from 'util';

/**
 * @author EoJinSeok
 * @description
 * Nest.js 용으로 추상화된 레디스 모듈은 AuthGuard에서 AOP(의존성 주입) 문제로 인하여 사용할 수 없습니다.
 * 따라서 기본적인 노드 레디스 모듈을 추가하여 Promise로 Wrapping한 후, 몇몇 함수를 추상화하였습니다.
 */
export namespace Redis {
  const keyStore = {
    getAuthorizationCodeKey: (userId) =>
      format('authorization_code:%s', userId),
    getToken: (userId) => format('token:%s', userId),
  };

  export const client = redis.createClient({
    host: process.platform === 'linux' ? 'redis' : 'localhost',
    port: 6379,
  });

  /**
   * 특정 필드의 데이터를 가져옵니다.
   *
   * @param key
   * @param field
   * @returns
   */
  export function hget(key: string, field: string): Promise<string> {
    return new Promise((resolve, reject) => {
      client.hget(key, field, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 필드에 데이터를 설정합니다.
   *
   * @param key
   * @param field
   * @param value
   * @returns
   */
  export function hset(key: string, field: string, value: string) {
    return new Promise((resolve, reject) => {
      client.hset(key, field, value, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 필드의 데이터를 삭제합니다.
   *
   * @param key
   * @param field
   * @returns
   */
  export function hdel(key: string, field: string) {
    return new Promise((resolve, reject) => {
      client.hdel(key, field, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 인증 코드를 발급합니다.
   * 이 코드는 레디스의 TTL 기능을 사용하여 10분간만 유효합니다.
   *
   * @param userId
   * @param code
   * @returns
   */
  export function saveAuthorizationCode(
    userId: string,
    code: string,
    validationMinutes = 10,
  ) {
    const authorizationCodeProc = new Promise((resolve, reject) => {
      const key = keyStore.getAuthorizationCodeKey(userId);

      client.set(key, code, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(key);
      });
    }).then((key) => {
      return new Promise((resolve, reject) => {
        // 10분간 유효
        const ttl = validationMinutes * 60;
        client.expire(key as string, ttl, (err, reply) => {
          if (err) {
            reject(err);
          }
          resolve(reply);
        });
      });
    });

    return authorizationCodeProc;
  }

  /**
   * API 사용량을 증감시킵니다.
   *
   * @param userId
   * @returns
   */
  export function increaseApiUsage(userId: string) {
    return new Promise((resolve, reject) => {
      const key = `apiUsage:${userId}`;

      client.INCR(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 키에 대한 값을 설정합니다.
   *
   * @param key
   * @param value
   * @returns
   */
  export function set(key: string, value: string) {
    return new Promise((resolve, reject) => {
      client.set(key, value, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 키에 대한 값을 획득합니다.
   *
   * @param userId
   * @returns
   */
  export function get(key: string) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 키를 삭제합니다.
   *
   * @returns
   */
  export function del(key: string) {
    return new Promise((resolve, reject) => {
      client.del(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * API 사용량을 증감시킵니다.
   *
   * @param userId
   * @returns
   */
  export function increaseApiUsage2(userId: string, uri: string) {
    return new Promise((resolve, reject) => {
      const key = `apiUsage:${userId}:${uri}`;

      client.INCR(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 사용자에 대한 API 사용량을 획득합니다.
   *
   * @param userId
   * @returns
   */
  export function getApiUsage(userId: string) {
    return new Promise((resolve, reject) => {
      const key = `apiUsage:${userId}:*`;

      client.keys(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 사용자에 대한 API 사용량을 획득합니다.
   *
   * @param userId
   * @returns
   */
  export function getApiUsage2(userId: string, uri: string) {
    return new Promise((resolve, reject) => {
      const key = `apiUsage:${userId}:${uri}`;

      client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 특정 키에 대한 API 사용량을 획득합니다.
   *
   * @param userId
   * @returns
   */
  export function getApiUsageAsKey(key: string) {
    return new Promise((resolve, reject) => {
      client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  export function getApiUsageForAllUsers() {
    return new Promise((resolve, reject) => {
      const key = `apiUsage:*`;

      client.keys(key, (err, reply) => {
        if (err) {
          reject(key);
        }

        resolve(reply);
      });
    }) as Promise<string[]>;
  }

  /**
   * 인증 코드가 있는 지 확인합니다.
   * @param userId {string}
   * @returns
   */
  export function getAuthorizationCode(userId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const key = keyStore.getAuthorizationCodeKey(userId);

      client.get(key, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 현재 레디스에 할당되어있는 키를 반환합니다.
   *
   * @returns
   */
  export function getAllKeys() {
    return new Promise((resolve, reject) => {
      client.keys('*', (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 유저 ID에 따른 새로 고침 토큰을 획득합니다.
   *
   * @param userId
   * @returns
   */
  export function getRefreshToken(userId: string) {
    return new Promise((resolve, reject) => {
      client.hget('JWT_REFRESH_TOKEN', userId, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  /**
   * 저장되어있는 Refresh Token을 모두 반환합니다.
   *
   * @returns
   */
  export function getIssuedLastLoginMember() {
    return new Promise((resolve, reject) => {
      client.hkeys('JWT_REFRESH_TOKEN', (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }

  export async function getValuesForPagination(
    key: string,
    offset?: string,
    limit?: string,
  ) {
    const proc = new Promise((resolve, reject) => {
      client.scan(offset, 'MATCH', key, 'COUNT', limit, (err, reply) => {
        if (err) {
          reject(err);
        }
        resolve(reply);
      });
    });
  }
}
