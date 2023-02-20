import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import * as RSS from 'rss';
import * as nestCore from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { RSS_MODULE_OPTIONS } from './rss.constant';
import { RssModuleOptions } from './interfaces/rss-option.interface';
import { PostService } from 'src/entities/post/post.service';

@Injectable()
export class RssService {
    constructor(
        private readonly postService: PostService,
        @Inject(RSS_MODULE_OPTIONS) private readonly options: RssModuleOptions,
    ) {}

    async getFeeds() {
        const { postUrl, author } = this.options;

        const feed = new RSS({
            ...this.options,
        });

        // 5개의 포스트만 가져옵니다.
        const { entities: posts } = await this.postService.findAll(1);

        for (const post of posts) {
            feed.item({
                title: post.title,
                description: post.previewContent,
                url: `${postUrl}/${post.id}`,
                date: post.uploadDate.toUTCString().replace('GMT', '+0000'),
                author,
            });
        }

        return feed.xml();
    }
}
