import { Module } from '@nestjs/common';

export type I18nModuleProps = {
    defaultLanguage: string;
    supportedLanguages: string[];
    imports: any[];
    useFactory?: (...args: any[]) => any;
    inject?: any[];
};

/**
 * @class I18nModule
 * @deprecated 개발이 중단되었거나 더 이상 사용되지 않음.
 */
@Module({
    imports: [],
})
export class I18nModule {}
