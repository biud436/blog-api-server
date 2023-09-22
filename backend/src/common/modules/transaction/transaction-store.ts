import {
    AFTER_TRANSACTION_TOKEN,
    BEFORE_TRANSACTION_TOKEN,
    TRANSACTION_COMMIT_TOKEN,
    TRANSACTION_ROLLBACK_TOKEN,
} from 'src/common/decorators/transactional';
import { ITransactionStore } from './interfaces/transaction-store.interface';

/**
 * @class TransactionStore
 * @author 어진석(biud436)
 * @description
 * 이 클래스는 트랜잭션 존에서 가상 트랜잭션 ID를 부여하고 관리합니다.
 *
 * `@BeforeTransaction`,
 * `@AfterTransaction`,
 * `@Commit`,
 * `@Rollback`
 *
 * 또한 트랜잭션 존에서 위 데코레이터가 마킹된 메소드를 실행합니다.
 *
 * 스토어 클래스는 최초 서버가 실행될 때 완전 탐색을 합니다.
 * 이후로는 캐싱된 값에서 마킹 여부를 확인하기 때문에 성능에 영향을 주지 않습니다.
 */
export class TransactionStore {
    constructor(
        public store: ITransactionStore,
        public methods: string[],
        public virtualTransactionId: string,
    ) {}

    isBeforeTransactionToken(): boolean {
        return !!this.store[BEFORE_TRANSACTION_TOKEN];
    }

    isAfterTransactionToken(): boolean {
        return !!this.store[AFTER_TRANSACTION_TOKEN];
    }

    isTransactionCommitToken(): boolean {
        return !!this.store[TRANSACTION_COMMIT_TOKEN];
    }

    isTransactionRollbackToken(): boolean {
        return !!this.store[TRANSACTION_ROLLBACK_TOKEN];
    }

    getBeforeTransactionMethodName(): string | undefined {
        return this.store[BEFORE_TRANSACTION_TOKEN];
    }

    getAfterTransactionMethodName(): string | undefined {
        return this.store[AFTER_TRANSACTION_TOKEN];
    }

    getTransactionCommitMethodName(): string | undefined {
        return this.store[TRANSACTION_COMMIT_TOKEN];
    }

    getTransactionRollbackMethodName(): string | undefined {
        return this.store[TRANSACTION_ROLLBACK_TOKEN];
    }

    async action(
        targetInjectable: InstanceType<any>,
        method: string,
        ...args: unknown[]
    ) {
        const txId = this.virtualTransactionId;
        const result = targetInjectable[method].call(
            targetInjectable,
            txId,
            ...args,
        );

        if (result instanceof Promise) {
            return await result;
        }

        return result;
    }
}
