import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { promisify, format } from 'util';

export namespace Redis {
    export type KeyStore = {
        getAuthorizationCodeKey: (userId: string) => string;
        getToken: (userId: string) => string;
    };

    export const keyStore = <KeyStore>{
        getAuthorizationCodeKey: (userId) =>
            format('authorization_code:%s', userId),
        getToken: (userId) => format('token:%s', userId),
    };
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private static EVERY_24_HOURS = 60 * 60 * 24;

    public client = createClient({
        socket: {
            host: process.platform === 'linux' ? 'redis' : 'localhost',
            port: 6379,
        },
    });

    /**
     * 서버가 시작된 직후 자동으로 실행됩니다.
     */
    async onModuleInit(): Promise<void> {
        await this.connect();
    }

    async onModuleDestroy(): Promise<void> {
        await this.client.quit();
    }

    async connect() {
        await this.client.connect();
    }

    async hget(key: string, field: string): Promise<string> {
        return await this.client.hGet(key, field);
    }

    async hset(key: string, field: string, value: string) {
        return await this.client.HSET(key, field, value);
    }

    async hdel(key: string, field: string) {
        return await this.client.HDEL(key, field);
    }

    /**
     * 인증 코드를 발급합니다.
     * 이 코드는 레디스의 TTL 기능을 사용하여 10분간만 유효합니다.
     *
     * @param userId
     * @param code
     * @returns
     */
    async saveAuthorizationCode(
        userId: string,
        code: string,
        validationMinutes = 10,
    ) {
        const authorization = Redis.keyStore.getAuthorizationCodeKey(userId);
        const key = await this.client.SET(authorization, code);

        // 10분간 유효
        const ttl = validationMinutes * 60;
        return await this.client.EXPIRE(key, ttl);
    }

    /**
     * API 사용량을 증감시킵니다.
     *
     * @param userId
     * @returns
     */
    async increaseApiUsage(userId: string) {
        const key = `apiUsage:${userId}`;
        return await this.client.INCR(key);
    }

    /**
     * 임시 이미지 파일을 저장합니다.
     */
    async saveTemporarilyImageIds(
        userId: string,
        imageId: string,
        minutes = 20, // 20분간 유효
    ) {
        const key = `temporarily_image_path:${userId}:${imageId}`;
        this.set(key, imageId);

        const ttl = minutes * 60;
        return await this.client.EXPIRE(key, ttl);
    }

    /**
     * 임시 이미지 파일을 가져옵니다.
     *
     * @param userId
     * @param path
     * @returns
     */
    async getTemporarilyImageIds(userId: string) {
        const key = `temporarily_image_path:${userId}:*`;
        const keys = await this.client.KEYS(key);

        const ids = [];

        for (const key of keys) {
            const id = await this.client.GET(key);
            ids.push(id);
        }

        return ids;
    }

    async deleteTemporarilyImageIds(userId: string, imageId: string) {
        const key = `temporarily_image_path:${userId}:${imageId}`;
        return await this.client.DEL(key);
    }

    /**
     * 특정 키에 대한 값을 설정합니다.
     *
     * @param key
     * @param value
     * @returns
     */
    async set(key: string, value: string) {
        return await this.client.SET(key, value);
    }

    /**
     * 특정 키에 대한 값을 설정합니다.
     * 다만, 이 값은 특정 시간 동안에만 유효합니다.
     *
     * @param key
     * @param value
     * @param minutes
     * @returns
     */
    async set2(key: string, value: string, minutes: number) {
        await this.set(key, value);

        const ttl = minutes * 60;
        return await this.client.EXPIRE(key, ttl);
    }

    /**
     * 특정 키에 대한 값을 획득합니다.
     *
     * @param userId
     * @returns
     */
    async get(key: string) {
        return await this.client.GET(key);
    }

    /**
     * 특정 키를 삭제합니다.
     *
     * @returns
     */
    async del(key: string) {
        return await this.client.DEL(key);
    }

    /**
     * API 사용량을 증감시킵니다.
     *
     * @param userId
     * @returns
     */
    async increaseApiUsage2(userId: string, uri: string) {
        const key = `apiUsage:${userId}:${uri}`;

        return await this.client.INCR(key);
    }

    async increasePostViewCount(postId: number) {
        const key = `post_view_count:${postId}`;

        return await this.client.INCR(key);
    }

    /**
     * 조회 여부를 확인합니다.
     * @param postId
     * @param ip
     * @returns
     */
    async isViewedPost(postId: number, ip: string) {
        const key = `post_viewed:${postId}:${ip}`;
        const result = await this.client.GET(key);

        return result === '1';
    }

    /**
     * 조회 여부가 확인되었음을 표시합니다.
     *
     * @param postId
     * @param ip
     * @returns
     */
    async setViewedPost(postId: number, ip: string) {
        const key = `post_viewed:${postId}:${ip}`;
        const ttl = RedisService.EVERY_24_HOURS;
        await this.set(key, '1');
        return await this.client.EXPIRE(key, ttl);
    }

    /**
     * 특정 사용자에 대한 API 사용량을 획득합니다.
     *
     * @param userId
     * @returns
     */
    async getApiUsage(userId: string) {
        const key = `apiUsage:${userId}`;
        return await this.client.keys(key);
    }

    /**
     * 특정 사용자에 대한 API 사용량을 획득합니다.
     *
     * @param userId
     * @returns
     */
    async getApiUsage2(userId: string, uri: string) {
        const key = `apiUsage:${userId}:${uri}`;

        return await this.client.GET(key);
    }

    async getApiUsageAsKey(key: string): Promise<string> {
        return await this.client.GET(key);
    }

    async getApiUsageForAllUsers(): Promise<string[]> {
        const key = 'apiUsage:*';

        return await this.client.KEYS(key);
    }

    /**
     * 인증 코드가 있는 지 확인합니다.
     * @param userId {string}
     * @returns
     */
    async getAuthorizationCode(userId: string): Promise<string> {
        const key = Redis.keyStore.getAuthorizationCodeKey(userId);
        return await this.client.GET(key);
    }

    /**
     * 현재 레디스에 할당되어있는 키를 반환합니다.
     *
     * @returns
     */
    async getAllKeys() {
        return await this.client.KEYS('*');
    }

    /**
     * 현재 레디스에 할당되어있는 키를 반환합니다.
     *
     * @returns
     */
    async getKeys(key: string) {
        return await this.client.KEYS(key);
    }

    /**
     * 유저 ID에 따른 새로 고침 토큰을 획득합니다.
     *
     * @param userId
     * @returns
     */
    async getRefreshToken(userId: string): Promise<string> {
        return await this.client.HGET('JWT_REFRESH_TOKEN', userId);
    }

    async getIssuedLastLoginMember(): Promise<string[]> {
        return await this.client.HKEYS('JWT_REFRESH_TOKEN');
    }

    async getValuesForPagination(key: string, offset: number, limit: number) {
        return await this.client.scan(offset, {
            MATCH: key,
            COUNT: limit,
        });
    }
}
