import { Injectable, Logger } from '@nestjs/common';
import {
    TRANSACTIONAL_PARAMS,
    TransactionIsolationLevel,
} from 'src/common/decorators/transactional';
import { EntityManager } from 'typeorm';
import { TransactionStore } from './transaction-store';

/**
 * @class TransactionManagerConsumer
 * @author 어진석(biud436)
 * @description This class is a consumer that executes the transaction.
 */
@Injectable()
export class TransactionManagerConsumer {
    private logger = new Logger(TransactionManagerConsumer.name);

    public execute(
        entityManager: EntityManager,
        transactionIsolationLevel: TransactionIsolationLevel,
        target: InstanceType<any>,
        methodName: string,
        args: unknown[],
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        resolve: (value: unknown) => void,
        reject: (reason?: unknown) => void,
        store: TransactionStore,
    ) {
        entityManager
            .transaction(transactionIsolationLevel, async (em) => {
                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    target,
                    methodName,
                );

                if (Array.isArray(params) && params.length > 0) {
                    if (Array.isArray(args) && args.length > 0) {
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
                    if (result instanceof Promise) {
                        return resolve(await result);
                    } else {
                        resolve(result);
                    }
                } catch (err: any) {
                    this.logger.error(
                        `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
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
                    `트랜잭션을 실행하는 도중 오류가 발생했습니다1: ${err.message}`,
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
            });
        return args;
    }
}
