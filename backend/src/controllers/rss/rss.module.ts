import { DynamicModule, Module, ModuleMetadata } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssController } from './rss.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RSS_MODULE_OPTIONS } from './rss.constant';
import { RssModuleOptions } from './interfaces/rss-option.interface';
import { PostModule } from 'src/entities/post/post.module';

@Module({})
export class RssModule {
  static register(
    options: Pick<RssModuleOptions, 'title' | 'description' | 'author'>,
  ): DynamicModule {
    return {
      module: RssModule,
      imports: [PostModule, ConfigModule],
      controllers: [RssController],
      providers: [
        RssService,
        {
          provide: RSS_MODULE_OPTIONS,
          useFactory: (configService: ConfigService): RssModuleOptions => {
            return {
              feed_url: `${configService.getOrThrow('BLOG_URL')}/rss`,
              site_url: configService.getOrThrow('BLOG_URL'),
              postUrl: `${configService.getOrThrow('BLOG_URL')}/posts`,
              ...options,
            };
          },
          inject: [ConfigService],
        },
      ],
    };
  }
}
