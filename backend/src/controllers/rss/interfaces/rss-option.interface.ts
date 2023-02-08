import { ModuleMetadata, Provider, Type } from '@nestjs/common';

export interface RssModuleOptions {
    title: string;
    description: string;
    feed_url: string;
    site_url: string;

    /**
     * 블로그 포스트 URL
     */
    postUrl: string;

    /**
     * RSS 발행자
     */
    author: string;
}

export interface RssModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    useFactory?: (
        ...args: any[]
    ) => Promise<RssModuleOptions> | RssModuleOptions;

    inject?: any[];
}
