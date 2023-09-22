import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
    AFTER_TRANSACTION_TOKEN,
    BEFORE_TRANSACTION_TOKEN,
    TRANSACTIONAL_TOKEN,
    TRANSACTIONAL_ZONE_TOKEN,
    TRANSACTION_COMMIT_TOKEN,
    TRANSACTION_ROLLBACK_TOKEN,
} from 'src/common/decorators/transactional';

/**
 * @author 어진석(biud436)
 * @class TransactionReflectManager
 */
@Injectable()
export class TransactionReflectManager {
    constructor(private readonly reflector: Reflector) {}

    /**
     * 트랜잭션 존인지 여부를 확인합니다.
     *
     * @param targetClass
     * @returns
     */
    public isTransactionZone(targetClass: any) {
        return this.reflector.get<boolean>(
            TRANSACTIONAL_ZONE_TOKEN,
            targetClass,
        );
    }

    /**
     * 트랜잭션 메소드인지 확인합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public isTransactionalZoneMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTIONAL_TOKEN, target, key) !== undefined
        );
    }

    /**
     * BeforeTransaction 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public isBeforeTransactionMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(BEFORE_TRANSACTION_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * AfterTransaction 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public isAfterTransactionMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(AFTER_TRANSACTION_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * 커밋 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public isCommitMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTION_COMMIT_TOKEN, target, key) !==
            undefined
        );
    }

    /**
     * 롤백 메서드 여부를 반환합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    public isRollbackMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTION_ROLLBACK_TOKEN, target, key) !==
            undefined
        );
    }
}
