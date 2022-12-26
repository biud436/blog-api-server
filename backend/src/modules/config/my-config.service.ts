import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { MY_CONFIG_METADATA_KEY } from './types/my-config.decorator';

@Injectable()
export class MyBlogConfigService implements OnModuleInit {
    private readonly logger: Logger = new Logger(MyBlogConfigService.name);

    constructor(
        private readonly configService: ConfigService,
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
    ) {}

    async onModuleInit() {
        const controllers = this.discoveryService.getControllers();
        const providers = this.discoveryService.getProviders();

        for (const controller of controllers) {
            const { instance, name } = controller;

            this.logger.debug(`Controller: ${name} ${Object.keys(instance)}`);
        }

        for (const provider of providers) {
            const { instance, name } = provider;

            // 싱글턴 프로바이더만 출력
            if (provider.isDependencyTreeStatic()) {
                this.logger.debug(`isDependencyTreeStatic - Provider: ${name}`);
            } else {
                this.logger.debug(`Provider: ${name}`);
            }
        }

        const YOUR_OWN_METADATA_KEY = 'YOUR_OWN_METADATA_KEY';

        // 싱글턴 프로바이더의 모든 메서드를 출력합니다 (성능은 좋지 않습니다)
        providers
            .filter((provider) => provider.isDependencyTreeStatic())
            .filter((e) => e.instance && Object.getPrototypeOf(e.instance))
            .filter(({ instance, metatype }) => {
                if (!instance || !metatype) {
                    return false;
                }
                return true;
            })
            .forEach((instanceWrapper) => {
                const { instance } = instanceWrapper;
                const className = instance.constructor.name;

                //  Object.getPrototypeOf() 메서드는 객체의 프로토타입을 반환합니다.
                const prototype = Object.getPrototypeOf(instance);

                this.metadataScanner.scanFromPrototype(
                    instance,
                    prototype,
                    (key) => {
                        this.logger.log(`${className}.${instance[key].name}`);

                        // 메타 데이터를 취득합니다.
                        const targets = this.reflector.get(
                            MY_CONFIG_METADATA_KEY,
                            instance[key],
                        );

                        if (!targets) {
                            return;
                        }

                        this.logger.log(`targets: ${targets}`);
                    },
                );
            });
    }
}
