import { DynamicModule, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import {
    HealthCheckOptions,
    HEALTH_CHECK_OPTIONS,
} from './health-check.constant';
import { HealthCheckController } from './health-check.controller';

@Module({})
export class HealthCheckModule {
    static register(options: HealthCheckOptions): DynamicModule {
        return {
            module: HealthCheckModule,
            imports: [TerminusModule],
            controllers: [HealthCheckController],
            providers: [
                {
                    provide: HEALTH_CHECK_OPTIONS,
                    useFactory: () => options,
                },
            ],
        };
    }
}
