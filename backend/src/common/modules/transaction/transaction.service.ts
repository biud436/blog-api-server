import {
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
    TRANSACTIONAL_PARAMS,
    TRANSACTIONAL_TOKEN,
    TRANSACTIONAL_ZONE_TOKEN,
    TRANSACTION_ENTITY_MANAGER,
    TRANSACTION_ISOLATE_LEVEL,
} from 'src/common/decorators/transactional';
import { INJECT_QUERYRUNNER_TOKEN } from 'src/common/decorators/transactional/inject-query-runner.decorator';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionManagerConsumer } from './tx-manager.consumer';
import { TransactionQueryRunnerConsumer } from './tx-query-runner.consumer';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

/**
 * @author 어진석(biud436)
 * @class TransactionService
 * @description
 * 트랜잭션 서비스는 트랜잭션을 쉽게 사용할 수 있도록 도와줍니다.
 */
@Injectable()
export class TransactionService implements OnModuleInit {
    private readonly logger: Logger = new Logger(TransactionService.name);

    /**
     * 트랜잭션 매니저 컨슈머
     */
    private readonly txManagerConsumer: TransactionManagerConsumer;

    /**
     * 트랜잭션 쿼리 러너 컨슈머
     */
    private readonly txQueryRunnerConsumer: TransactionQueryRunnerConsumer;

    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {
        this.txManagerConsumer = new TransactionManagerConsumer();
        this.txQueryRunnerConsumer = new TransactionQueryRunnerConsumer();
    }

    public async onModuleInit() {
        await this.registerTransactional();
    }

    /**
     * 트랜잭션 메소드를 등록합니다.
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
            // 싱글톤 여부를 확인합니다.
            const isSingletone = wrapper.isDependencyTreeStatic();

            const targetClass = isSingletone
                ? (wrapper.instance.constructor as Type<any>)
                : wrapper.metatype.prototype;

            const target = isSingletone
                ? wrapper.instance
                : wrapper.metatype.prototype;

            // 트랜잭션 존일 경우에만 메소드를 스캔합니다.
            if (this.isTransactionZone(targetClass)) {
                for (const methodName of this.metadataScanner.getAllMethodNames(
                    target,
                )) {
                    if (this.isTransactionalZoneMethod(target, methodName)) {
                        this.wrap(target, methodName);
                    }
                }
            }
        }
    }

    /**
     * 트랜잭션 존인지 여부를 확인합니다.
     *
     * @param targetClass
     * @returns
     */
    private isTransactionZone(targetClass: any) {
        return this.reflector.get<boolean>(
            TRANSACTIONAL_ZONE_TOKEN,
            targetClass,
        );
    }

    /**
     * 트랜잭션 메소드를 래핑합니다.
     *
     * @param target
     * @param methodName
     */
    private wrap(target: any, methodName: string) {
        const wrapTransaction = () => {
            const originalMethod = target[methodName];

            const transactionIsolationLevel = this.getTransactionIsolationLevel(
                target,
                methodName,
            );

            const entityManager = this.dataSource.manager;

            const transactionalEntityManager = this.getTxManager(
                target,
                methodName,
            );

            // Proxy를 위해 콜백을 생성합니다 (Proxy 객체를 사용하지 않음)
            const callback = async (...args: any[]) => {
                return new Promise((resolve, reject) => {
                    if (transactionalEntityManager) {
                        this.txManagerConsumer.execute(
                            entityManager,
                            transactionIsolationLevel,
                            target,
                            methodName,
                            args,
                            originalMethod,
                            resolve,
                            reject,
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
                        );
                    }
                });
            };

            return callback;
        };

        try {
            // 기존 메소드를 트랜잭션 메소드로 대체합니다.
            target[methodName] = wrapTransaction();
        } catch (e: any) {
            throw new InternalServerErrorException(
                `트랜잭션 메소드를 대체하는 도중 오류가 발생했습니다: ${e.message}`,
            );
        }
    }

    /**
     * 트랜잭션 엔티티 매니저가 필요한 지 여부를 확인합니다.
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
     * 트랜잭션 격리 레벨을 가져옵니다.
     *
     * @param target
     * @param methodName
     * @returns
     */
    private getTransactionIsolationLevel(
        target: any,
        methodName: string,
    ): IsolationLevel {
        return <IsolationLevel>(
            (Reflect.getMetadata(
                TRANSACTION_ISOLATE_LEVEL,
                target,
                methodName,
            ) || DEFAULT_ISOLATION_LEVEL)
        );
    }

    /**
     * 트랜잭션 메소드인지 확인합니다.
     *
     * @param target
     * @param key
     * @returns
     */
    private isTransactionalZoneMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTIONAL_TOKEN, target, key) !== undefined
        );
    }
}
