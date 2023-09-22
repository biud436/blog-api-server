import { Injectable, Logger } from '@nestjs/common';
import {
    TRANSACTIONAL_PARAMS,
    TransactionIsolationLevel,
} from 'src/common/decorators/transactional';
import { INJECT_QUERYRUNNER_TOKEN } from 'src/common/decorators/transactional/inject-query-runner.decorator';
import { DataSource } from 'typeorm';
import { TransactionStore } from './transaction-store';

/**
 * @class TransactionQueryRunnerConsumer
 * @author 어진석(biud436)
 * @description This class is a consumer that executes the transaction using QueryRunner.
 */
@Injectable()
export class TransactionQueryRunnerConsumer {
    private logger: Logger = new Logger(TransactionQueryRunnerConsumer.name);
    public execute(
        dataSource: DataSource,
        transactionIsolationLevel: TransactionIsolationLevel,
        target: InstanceType<any>,
        methodName: string,
        originalMethod: (...args: unknown[]) => unknown | Promise<unknown>,
        reject: (reason?: unknown) => void,
        resolve: (value: unknown) => void,
        args: unknown[],
        store: TransactionStore,
    ) {
        const txWrapper = async (...args: any[]) => {
            // 단일 트랜잭션을 실행합니다.
            const queryRunner = dataSource.createQueryRunner();

            await queryRunner.connect();
            await queryRunner.startTransaction(transactionIsolationLevel);

            try {
                // QueryRunner를 찾아서 대체한다.
                const params = Reflect.getMetadata(
                    TRANSACTIONAL_PARAMS,
                    target,
                    methodName,
                );

                if (Array.isArray(params) && params.length > 0) {
                    const paramIndex = Reflect.getMetadata(
                        INJECT_QUERYRUNNER_TOKEN,
                        target,
                        methodName,
                    ) as number;

                    params.forEach((param, _index) => {
                        args[paramIndex] = queryRunner;
                    });
                }

                // 원본 메소드를 실행합니다.
                const result = originalMethod.call(target, ...args);

                let ret = null;
                // promise인가?
                if (result instanceof Promise) {
                    ret = await result;
                } else {
                    ret = result;
                }

                await queryRunner.commitTransaction();

                if (store.isTransactionCommitToken()) {
                    await store.action(
                        target,
                        store.getTransactionCommitMethodName()!,
                    );
                }

                return ret;
            } catch (e: any) {
                await queryRunner.rollbackTransaction();

                if (store.isTransactionRollbackToken()) {
                    await store.action(
                        target,
                        store.getTransactionRollbackMethodName()!,
                    );
                }

                this.logger.error(
                    `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${e.stack}`,
                );
                reject(e);
            } finally {
                await queryRunner.release();

                if (store.isAfterTransactionToken()) {
                    await store.action(
                        target,
                        store.getAfterTransactionMethodName()!,
                    );
                }
            }
        };

        resolve(txWrapper(...args));
    }
}
