import { Module } from '@nestjs/common';

@Module({
    imports: [],
})
export class ConfiguredDatabaseModule {
    public static isDelvelopment(): boolean {
        return process.env.NODE_ENV !== 'production';
    }
}
