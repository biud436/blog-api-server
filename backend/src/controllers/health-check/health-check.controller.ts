import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Inject,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    DiskHealthIndicator,
    HealthCheck,
    HealthCheckService,
    HttpHealthIndicator,
    MemoryHealthIndicator,
    TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import {
    HealthCheckOptions,
    HEALTH_CHECK_OPTIONS,
} from './health-check.constant';

@Controller('health-check')
export class HealthCheckController {
    constructor(
        private readonly health: HealthCheckService,
        private readonly http: HttpHealthIndicator,
        private readonly db: TypeOrmHealthIndicator,
        private readonly memory: MemoryHealthIndicator,
        private readonly disk: DiskHealthIndicator,
        @Inject(HEALTH_CHECK_OPTIONS) private options: HealthCheckOptions,
    ) {}

    /**
     * 헬스 체크를 수행합니다.
     *
     * @tag 헬스 체크
     * @returns
     */
    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () =>
                this.http.pingCheck(
                    'http',
                    this.options.pingCheck.url ?? 'https://blog.biud436.com',
                ),
            () => this.db.pingCheck('database'), // 데이터베이스 헬스 체크
            () =>
                this.memory.checkHeap(
                    'memory_heap',
                    this.options.checkHeap.heapUsedThreshold,
                ), // 메모리 헬스 체크 ( 300MB 이상의 메모리 사용 불가 )
            () =>
                this.disk.checkStorage('disk_space', {
                    path: process.platform === 'win32' ? 'c:' : '/',
                    thresholdPercent: 30,
                }),
        ]);
    }
}
