import { Inject, Injectable } from '@nestjs/common';
import RSS from 'rss';
import { RSS_MODULE_OPTIONS } from './rss.constant';
import { RssModuleOptions } from './interfaces/rss-option.interface';
import { PostService } from 'src/entities/post/post.service';
import { Post } from 'src/entities/post/entities/post.entity';
import { FeedItem } from './rss-feed-item';

export type RSSFeed = any;

@Injectable()
export class RssService {
    constructor(
        private readonly postService: PostService,
        @Inject(RSS_MODULE_OPTIONS) private readonly options: RssModuleOptions,
    ) {}

    async getFeeds(): Promise<string> {
        const feed = this.createFeed(this.options);

        const { entities: posts } = await this.postService.getFeed(1);

        for (const post of posts) {
            feed.item(this.createFeedItem(post));
        }

        return feed.xml();
    }

    private createFeed(options: RssModuleOptions): RSS {
        return new RSS({
            ...options,
        });
    }

    private createFeedItem(post: Post): FeedItem {
        const { postUrl, author } = this.options;
        return FeedItem.of({
            title: post.title,
            description: post.previewContent ?? '',
            url: `${postUrl}/${post.id}`,
            date: post.uploadDate.toUTCString().replace('GMT', '+0000'),
            author,
        });
    }
}
