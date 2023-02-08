import { Module } from '@nestjs/common';

/**
 * @class ConfiguredDatabaseModule
 * @deprecated 개발이 중단되었거나 더 이상 사용되지 않음.
 */
@Module({
    imports: [],
})
export class ConfiguredDatabaseModule {
    public static isDelvelopment(): boolean {
        return process.env.NODE_ENV !== 'production';
    }
}
