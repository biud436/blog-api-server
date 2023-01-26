import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigModuleOptions } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { MyBlogConfigService } from './my-config.service';

@Module({
    imports: [ConfigModule, DiscoveryModule],
    providers: [MyBlogConfigService],
})
export class MyBlogConfigModule {
    static register(options: ConfigModuleOptions): DynamicModule {
        return {
            module: MyBlogConfigModule,
            providers: [
                {
                    provide: 'CONFIG_OPTIONS',
                    useFactory: () => options,
                },
            ],
        };
    }
}
