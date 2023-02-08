import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Nginx 프록시 서버에서 동작하므로 아래 설정이 필요합니다.
 */
@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
    protected getTracker(req: Record<string, any>): string {
        return req.ips.length ? req.ips[0] : req.ip;
    }
}
