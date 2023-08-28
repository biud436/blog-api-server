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

@Injectable()
export class TransactionService implements OnModuleInit {
    private readonly logger: Logger = new Logger(TransactionService.name);
    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly reflector: Reflector,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        await this.registerProviders();
    }

    async registerProviders() {
        const providers = this.discoveryService.getProviders();

        const wrappers = providers.filter(
            (wrapper) =>
                wrapper.instance && Object.getPrototypeOf(wrapper.instance),
        );

        for (const wrapper of wrappers) {
            const targetClass = wrapper.isDependencyTreeStatic()
                ? (wrapper.instance.constructor as Type<any>)
                : wrapper.metatype.prototype;

            const isTransaction = this.reflector.get<boolean>(
                TRANSACTIONAL_ZONE_TOKEN,
                targetClass,
            );

            const target = wrapper.isDependencyTreeStatic()
                ? wrapper.instance
                : wrapper.metatype.prototype;

            if (isTransaction) {
                for (const method of this.getPrototypeMethods(target)) {
                    if (
                        this.isTransactionalZoneMethod(target, method as string)
                    ) {
                        const transactionRunner = () => {
                            const originalMethod = target[method as any];
                            // 트랜잭션 격리 레벨을 가져옵니다.
                            const transactionIsolationLevel =
                                Reflect.getMetadata(
                                    TRANSACTION_ISOLATE_LEVEL,
                                    target,
                                    method as any,
                                ) || DEFAULT_ISOLATION_LEVEL;

                            const entityManager = this.dataSource.manager;

                            // 트랜잭션 엔티티 매니저가 필요한가?
                            const transactionalEntityManager =
                                Reflect.getMetadata(
                                    TRANSACTION_ENTITY_MANAGER,
                                    target,
                                    method as any,
                                );

                            const callback = async (...args: any[]) => {
                                return new Promise((resolve, reject) => {
                                    if (transactionalEntityManager) {
                                        // 트랜잭션 엔티티 매니저를 실행합니다.
                                        entityManager
                                            .transaction(
                                                transactionIsolationLevel,
                                                async (em) => {
                                                    const params =
                                                        Reflect.getMetadata(
                                                            TRANSACTIONAL_PARAMS,
                                                            target,
                                                            method as any,
                                                        );

                                                    if (
                                                        Array.isArray(params) &&
                                                        params.length > 0
                                                    ) {
                                                        if (
                                                            Array.isArray(
                                                                args,
                                                            ) &&
                                                            args.length > 0
                                                        ) {
                                                            args = args.map(
                                                                (
                                                                    arg,
                                                                    index,
                                                                ) => {
                                                                    const param =
                                                                        params[
                                                                            index
                                                                        ];
                                                                    if (
                                                                        param instanceof
                                                                        EntityManager
                                                                    ) {
                                                                        return em;
                                                                    }
                                                                    return arg;
                                                                },
                                                            );
                                                        } else {
                                                            args = [em];
                                                        }
                                                    }

                                                    // 트랜잭션을 실행합니다.
                                                    try {
                                                        const result =
                                                            originalMethod.call(
                                                                target,
                                                                ...args,
                                                            );

                                                        // promise인가?
                                                        if (
                                                            result instanceof
                                                            Promise
                                                        ) {
                                                            return resolve(
                                                                await result,
                                                            );
                                                        } else {
                                                            resolve(result);
                                                        }
                                                    } catch (err: any) {
                                                        this.logger.error(
                                                            `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${err.message}`,
                                                        );

                                                        const queryRunner =
                                                            em.queryRunner;

                                                        if (queryRunner) {
                                                            queryRunner.rollbackTransaction();
                                                        }

                                                        reject(err);
                                                    }
                                                },
                                            )
                                            .catch((err) => {
                                                this.logger.error(
                                                    `트랜잭션을 실행하는 도중 오류가 발생했습니다1: ${err.message}`,
                                                );
                                                reject(err);
                                            });
                                    } else {
                                        const txWrapper = async (
                                            ...args: any[]
                                        ) => {
                                            // 단일 트랜잭션을 실행합니다.
                                            const queryRunner =
                                                this.dataSource.createQueryRunner();

                                            await queryRunner.connect();
                                            await queryRunner.startTransaction(
                                                transactionIsolationLevel,
                                            );

                                            try {
                                                // QueryRunner를 찾아서 대체한다.
                                                const params =
                                                    Reflect.getMetadata(
                                                        TRANSACTIONAL_PARAMS,
                                                        target,
                                                        method as any,
                                                    );

                                                if (
                                                    Array.isArray(params) &&
                                                    params.length > 0
                                                ) {
                                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                    const paramIndex =
                                                        Reflect.getMetadata(
                                                            INJECT_QUERYRUNNER_TOKEN,
                                                            target,
                                                            method as any,
                                                        ) as number;

                                                    params.forEach(
                                                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                        (param, _index) => {
                                                            args[paramIndex] =
                                                                queryRunner;
                                                        },
                                                    );
                                                }

                                                const result =
                                                    originalMethod.call(
                                                        target,
                                                        ...args,
                                                    );

                                                let ret = null;
                                                // promise인가?
                                                if (result instanceof Promise) {
                                                    ret = await result;
                                                } else {
                                                    ret = result;
                                                }

                                                await queryRunner.commitTransaction();

                                                return ret;
                                            } catch (e: any) {
                                                await queryRunner.rollbackTransaction();
                                                this.logger.error(
                                                    `트랜잭션을 실행하는 도중 오류가 발생했습니다: ${e.stack}`,
                                                );
                                                reject(e);
                                            } finally {
                                                await queryRunner.release();
                                            }
                                        };

                                        resolve(txWrapper(...args));
                                    }
                                });
                            };

                            return callback;
                        };

                        try {
                            target[method as any] = transactionRunner();
                        } catch (e: any) {
                            throw new InternalServerErrorException(
                                `트랜잭션 메소드를 실행하는 도중 오류가 발생했습니다: ${e.message}`,
                            );
                        }
                    }
                }
            }
        }
    }

    isTransactionalZoneMethod(target: object, key: string) {
        return (
            Reflect.getMetadata(TRANSACTIONAL_TOKEN, target, key) !== undefined
        );
    }

    getPrototypeMethods = (obj: any) => {
        const properties = new Set();
        let currentObj = obj;
        do {
            Object.getOwnPropertyNames(currentObj).map((item) =>
                properties.add(item),
            );

            currentObj = Object.getPrototypeOf(currentObj);
        } while (
            Object.getPrototypeOf(currentObj) &&
            Object.getPrototypeOf(currentObj) !== null
        );

        return [...properties.keys()].filter(
            (item) => typeof obj[item as any] === 'function',
        );
    };
}
