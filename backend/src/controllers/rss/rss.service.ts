import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import * as RSS from 'rss';
import * as nestCore from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { RssOptions, RSS_OPTIONS } from './rss.constant';

@Injectable()
export class RssService {
    constructor(
        private readonly postsService: PostsService,
        @Inject(RSS_OPTIONS) private readonly options: RssOptions,
    ) {}

    async getFeeds() {
        const { postUrl, author } = this.options;

        const feed = new RSS({
            ...this.options,
        });

        // 5개의 포스트만 가져옵니다.
        const { entities: posts } = await this.postsService.findAll(1);

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
