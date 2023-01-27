export const HEALTH_CHECK_OPTIONS = 'HEALTH_CHECK_OPTIONS';

export namespace HealthCheckConstant {
    export const DEFAULT_HEAP_SIZE = 300 * 1024 * 1024;
}

export interface HealthCheckOptions {
    pingCheck: {
        url: string;
    };
    checkHeap: {
        heapUsedThreshold: number;
    };
}
