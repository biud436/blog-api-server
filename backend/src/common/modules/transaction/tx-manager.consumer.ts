import { Injectable, Logger } from '@nestjs/common';
import {
    TRANSACTIONAL_PARAMS,
    TransactionIsolationLevel,
} from 'src/common/decorators/transactional';
import { DataSource, EntityManager } from 'typeorm';
import { isPromise } from 'util/types';
import { TransactionScanner } from './transaction-scanner';
import { TransactionStore } from './transaction-store';
import { isArrayOK } from './utils';

/**
 * @class TransactionManagerConsumer
 * @author 어진석(biud436)
 * @description This class is a consumer that executes the transaction.
 * @deprecated
 */
@Injectable()
export class TransactionManagerConsumer {
    private logger = new Logger(TransactionManagerConsumer.name);

    constructor(private readonly transactionScanner: TransactionScanner) {}

    /**
     * Executes the transaction.
     * This would be delegated transaction-related tasks like commits and rollbacks entirely to in this proxy class.
     *
     * @param entityManager 트랜잭션을 관리하는 EntityManager 객체를 지정합니다.
     * @param transactionIsolationLevel 트랜잭션 격리 수준을 지정합니다.
     * @param target 트랜잭션 관련 데코레이터를 찾을 클래스를 지정합니다.
     * @param methodName 트랜잭션 데코레이터를 찾을 메소드 명을 지정합니다.
     * @param args 원본 메소드의 인자를 지정합니다.
     * @param originalMethod 원본 메소드를 지정합니다.
     * @param resolve 비동기 처리 성공 시 호출될 함수를 지정합니다.
     * @param reject 비동기 처리 실패 시 호출될 함수를 지정합니다.
     * @param store 트랜잭션 스토어를 지정합니다.
     * @returns
     */
    public execute(
        dataSource: DataSource,
        transactionIsolationLevel: TransactionIsolationLevel,
        target: InstanceType<any>,
        methodName: string,
        args: unknown[],
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
        store: TransactionStore,
    ) {
        if (this.transactionScanner.isGlobalLock()) {
            this.logger.warn(
                'The transaction is nested. Please check the transaction decorator! the transactional is not supported nested transaction when injected the Entity Manager Strategy',
            );
            return;
        }

        this.logger.warn(
            '[DEPRECATED] EntityManager Strategy is now deprecated. Please use the query runner strategy instead.',
        );

        const queryRunner = dataSource.createQueryRunner();
        const entityManager = queryRunner.manager;

        entityManager
            .transaction(transactionIsolationLevel, async (em) => {
                await this.transactionScanner.globalLock({
                    queryRunner,
                    entityManager,
                    transactionIsolationLevel,
                    isEntityManager: true,
                });

                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    target,
                    methodName,
                );

                if (isArrayOK(params)) {
                    if (isArrayOK(args)) {
                        args = args.map((arg, index) => {
                            const param = params[index];
                            if (param instanceof EntityManager) {
                                return em;
                            }
                            return arg;
                        });
                    } else {
                        args = [em];
                    }
                }

                // execute the original method and then commit the transaction.
                try {
                    const result = originalMethod.call(target, ...args);

                    if (store.isTransactionCommitToken()) {
                        await store.action(
                            target,
                            store.getTransactionCommitMethodName()!,
                        );
                    }

                    // promise?
                    if (isPromise(result)) {
                        return resolve(await result);
                    } else {
                        resolve(result);
                    }
                } catch (err: any) {
                    this.logger.error(
                        `An error occurred while executing the transaction`,
                    );

                    const queryRunner = em.queryRunner;

                    if (queryRunner) {
                        await queryRunner.rollbackTransaction();
                    }

                    if (store.isTransactionRollbackToken()) {
                        await store.action(
                            target,
                            store.getTransactionRollbackMethodName()!,
                        );
                    }

                    reject(err);
                }
            })
            .catch((err) => {
                this.logger.error(
                    `An error occurred while executing the transaction`,
                );
                reject(err);
            })
            .finally(() => {
                // You notice that the below code is executed after the transaction is finished.
                // but it may not be executed immediately.
                if (store.isAfterTransactionToken()) {
                    setTimeout(() => {
                        store.action(
                            target,
                            store.getAfterTransactionMethodName()!,
                        );
                    }, 0);
                }

                this.transactionScanner.globalUnlock();
            });
        return args;
    }
}
