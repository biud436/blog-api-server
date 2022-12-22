import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { PostsService } from '../posts/posts.service';
import * as RSS from 'rss';
import * as nestCore from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DateTimeUtil } from 'src/libs/date/DateTimeUtil';

@Injectable()
export class RssService {
    constructor(
        private readonly postsService: PostsService,
        private readonly configService: ConfigService,
    ) {}

    async getFeeds() {
        const BLOG_URL = this.configService.getOrThrow('BLOG_URL');

        const feed = new RSS({
            title: '어진석의 블로그', // TODO: 설정 파일로 분리 필요. 블로그 이름을 가져와야 합니다.
            description: '어진석의 블로그',
            feed_url: `${BLOG_URL}/rss`,
            site_url: `${BLOG_URL}`,
        });

        // 5개의 포스트만 가져옵니다.
        const { entities: posts } = await this.postsService.findAll(1);

        for (const post of posts) {
            feed.item({
                title: post.title,
                description: post.previewContent,
                url: `${BLOG_URL}/posts/${post.id}`,
                date: post.uploadDate.toUTCString().replace('GMT', '+0000'),
                author: '어진석(테스트)',
            });
        }

        return feed.xml();
    }
}
