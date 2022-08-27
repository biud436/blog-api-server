import { Module } from '@nestjs/common';

export type I18nModuleProps = {
    defaultLanguage: string;
    supportedLanguages: string[];
    imports: any[];
    useFactory?: (...args: any[]) => any;
    inject?: any[];
};

@Module({
    imports: [],
})
export class I18nModule {}
