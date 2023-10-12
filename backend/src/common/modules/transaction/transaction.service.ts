import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    OnModuleInit,
    Type,
} from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core/discovery';
import { MetadataScanner } from '@nestjs/core/metadata-scanner';
import { Reflector } from '@nestjs/core/services';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DEFAULT_ISOLATION_LEVEL,
    TRANSACTIONAL_TOKEN,
    TRANSACTIONAL_ZONE_TOKEN,
    TRANSACTION_ENTITY_MANAGER,
    TRANSACTION_ISOLATE_LEVEL,
    TransactionIsolationLevel,
    BEFORE_TRANSACTION_TOKEN,
    AFTER_TRANSACTION_TOKEN,
    TRANSACTION_COMMIT_TOKEN,
    TRANSACTION_ROLLBACK_TOKEN,
} from 'src/common/decorators/transactional';
import { DataSource } from 'typeorm';
import { ITransactionStore } from './interfaces/transaction-store.interface';
import { TransactionReflectManager } from './transaction-reflect-manager';
import { TransactionStore } from './transaction-store';
import { TransactionManagerConsumer } from './tx-manager.consumer';
import { TransactionQueryRunnerConsumer } from './tx-query-runner.consumer';
import { v4 as uuidv4 } from 'uuid';

/**
 * @author 어진석(biud436)
 * @class TransactionService
 * @description
 * This class allows you to apply the transaction easily in NestJS.
 */
@Injectable()
export class TransactionService implements OnModuleInit {
    private readonly logger: Logger = new Logger(TransactionService.name);

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,

        private readonly txManagerConsumer: TransactionManagerConsumer,
        private readonly txQueryRunnerConsumer: TransactionQueryRunnerConsumer,
        private readonly reflectManager: TransactionReflectManager,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    public async onModuleInit() {
        await this.registerTransactional();
    }

    /**
     * Finds all providers and then register the transactional method.
     */
    private async registerTransactional() {
        const providers = this.discoveryService.getProviders();

        const wrappers = providers
            .filter((wrapper) => wrapper.isDependencyTreeStatic())
            .filter(
                (wrapper) =>
                    wrapper.instance && Object.getPrototypeOf(wrapper.instance),
            );

        for (const wrapper of wrappers) {
            // checks whether the target class is a singleton.
            const isSingletone = wrapper.isDependencyTreeStatic();

            const targetClass = isSingletone
                ? (wrapper.instance.constructor as Type<any>)
                : wrapper.metatype.prototype;

            const target = isSingletone
                ? wrapper.instance
                : wrapper.metatype.prototype;

            // if the target class is not marked as transactional zone, then skip it.
            if (!this.reflectManager.isTransactionZone(targetClass)) {
                continue;
            }

            const store = this.createStore(target);
            const methods = store.methods;

            for (const methodName of methods) {
                if (
                    this.reflectManager.isTransactionalZoneMethod(
                        target,
                        methodName,
                    )
                ) {
                    this.wrap(target, methodName, store);
                }
            }
        }
    }

    /**
     * Wrap the method to transactional method.
     *
     * @param target
     * @param methodName
     */
    private wrap(target: any, methodName: string, store: TransactionStore) {
        const wrapTransaction = () => {
            const originalMethod = target[methodName];

            const transactionIsolationLevel = this.getTransactionIsolationLevel(
                target,
                methodName,
            );

            const transactionalEntityManager = this.getTxManager(
                target,
                methodName,
            );

            // creates a callback function that executes the transaction.
            const callback = async (...args: any[]) => {
                if (store.isBeforeTransactionToken()) {
                    await store.action(
                        target,
                        store.getBeforeTransactionMethodName()!,
                    );
                }

                return new Promise((resolve, reject) => {
                    if (transactionalEntityManager) {
                        this.txManagerConsumer.execute(
                            this.dataSource,
                            transactionIsolationLevel,
                            target,
                            methodName,
                            args,
                            originalMethod,
                            resolve,
                            reject,
                            store,
                        );
                    } else {
                        this.txQueryRunnerConsumer.execute(
                            this.dataSource,
                            transactionIsolationLevel,
                            target,
                            methodName,
                            originalMethod,
                            reject,
                            resolve,
                            args,
                            store,
                        );
                    }
                });
            };

            return callback;
        };

        try {
            // replaces the original method to transactional method.
            target[methodName] = wrapTransaction();
        } catch (e: any) {
            throw new InternalServerErrorException(
                `트랜잭션 메소드를 대체하는 도중 오류가 발생했습니다: ${e.message}`,
            );
        }
    }

    /**
     * Creates a store class that manages the transactional method.
     *
     * @param target
     * @returns
     */
    private createStore(target: any): TransactionStore {
        const store: ITransactionStore = {};
        const methods = this.metadataScanner.getAllMethodNames(target);

        // prettier-ignore
        for (const method of methods) {
            if (this.reflectManager.isBeforeTransactionMethod(target, method)) {
                store[BEFORE_TRANSACTION_TOKEN] = method;
            } else if (this.reflectManager.isAfterTransactionMethod(target, method)) {
                store[AFTER_TRANSACTION_TOKEN] = method;
            } else if (this.reflectManager.isCommitMethod(target, method)) {
                store[TRANSACTION_COMMIT_TOKEN] = method;
            } else if (this.reflectManager.isRollbackMethod(target, method)) {
                store[TRANSACTION_ROLLBACK_TOKEN] = method;
            }
        }

        return new TransactionStore(store, methods, uuidv4());
    }

    /**
     * Checks whether the transaction entity manager is needed.
     *
     * @param target
     * @param methodName
     * @returns
     */
    private getTxManager(target: any, methodName: string): boolean {
        return Reflect.getMetadata(
            TRANSACTION_ENTITY_MANAGER,
            target,
            methodName,
        ) as boolean;
    }

    /**
     * Gets the transaction isolation level.
     *
     * @param target
     * @param methodName
     * @returns
     */
    private getTransactionIsolationLevel(
        target: any,
        methodName: string,
    ): TransactionIsolationLevel {
        return <TransactionIsolationLevel>(
            (Reflect.getMetadata(
                TRANSACTION_ISOLATE_LEVEL,
                target,
                methodName,
            ) || DEFAULT_ISOLATION_LEVEL)
        );
    }
}
