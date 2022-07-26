import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
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

@Controller('health-check')
@ApiTags('헬스 체크')
export class HealthCheckController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private db: TypeOrmHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) {}

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => this.http.pingCheck('http', 'https://google.co.kr'),
            () => this.db.pingCheck('database'), // 데이터베이스 헬스 체크
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 메모리 헬스 체크 ( 300MB 이상의 메모리 사용 불가 )
            () =>
                this.disk.checkStorage('disk_space', {
                    path: process.platform === 'win32' ? 'c:' : '/',
                    thresholdPercent: 30,
                }),
        ]);
    }
}
