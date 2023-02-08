import { DynamicModule, Module } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssController } from './rss.controller';
import { PostsModule } from '../posts/posts.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RssOptions, RSS_OPTIONS } from './rss.constant';

@Module({})
export class RssModule {
    static register(
        options: Pick<RssOptions, 'title' | 'description' | 'author'>,
    ): DynamicModule {
        return {
            module: RssModule,
            imports: [PostsModule, ConfigModule],
            controllers: [RssController],
            providers: [
                RssService,
                {
                    provide: RSS_OPTIONS,
                    useFactory: (configService: ConfigService): RssOptions => {
                        return {
                            feed_url: `${configService.getOrThrow(
                                'BLOG_URL',
                            )}/rss`,
                            site_url: configService.getOrThrow('BLOG_URL'),
                            postUrl: `${configService.getOrThrow(
                                'BLOG_URL',
                            )}/posts`,
                            ...options,
                        };
                    },
                    inject: [ConfigService],
                },
            ],
        };
    }
}
