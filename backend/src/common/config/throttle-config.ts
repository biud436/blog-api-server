export namespace ThrottleEx {
    export type TTL = number;
    export type Limit = number;
}
export type ThrottleInterval = [ThrottleEx.TTL, ThrottleEx.Limit];

/**
 * 30초에 8번까지만 요청 가능합니다.
 */
export const LOGIN_INTERVAL: ThrottleInterval = [8, 30];
