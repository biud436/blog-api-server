import { Inject, Injectable } from '@nestjs/common';
import RSS from 'rss';
import { RSS_MODULE_OPTIONS } from './rss.constant';
import { RssModuleOptions } from './interfaces/rss-option.interface';
import { PostService } from 'src/entities/post/post.service';
import iconv from 'iconv-lite';

@Injectable()
export class RssService {
  constructor(
    private readonly postService: PostService,
    @Inject(RSS_MODULE_OPTIONS) private readonly options: RssModuleOptions,
  ) {}

  async getFeeds(): Promise<string> {
    const { title, description, site_url, postUrl, author } = this.options;

    // RSS 인스턴스 생성
    const feed = new RSS({
      title: title,
      description: description,
      feed_url: `${site_url}/rss`,
      site_url: site_url,
      language: 'ko',
      image_url: `${site_url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      pubDate: new Date(),
      custom_namespaces: {
        // 필요한 경우 사용자 정의 네임스페이스 추가
      },
      custom_elements: [{ webMaster: author }, { managingEditor: author }],
    });

    const { entities: posts } = await this.postService.getFeed(1);

    for (const post of posts) {
      // HTML 태그 제거 및 특수 문자 처리
      let safeDescription = post.previewContent ?? '';
      safeDescription = safeDescription.replace(/<[^>]*>/g, '');

      const buffer = iconv.encode(safeDescription, 'utf8');
      safeDescription = iconv.decode(buffer, 'utf8');

      // 문제가 있는 특수 문자 제거
      safeDescription = safeDescription.replace(/[\uD800-\uDFFF]/g, '');

      // 설명 길이 제한 (선택 사항)
      safeDescription = safeDescription.substring(0, 200);
      if ((post.previewContent?.length || 0) > 200) {
        safeDescription += '...';
      }

      // RSS 아이템 추가
      feed.item({
        title: post.title,
        description: safeDescription,
        url: `${postUrl}/${post.id}`,
        guid: `${postUrl}/${post.id}`,
        date: post.uploadDate,
        author: post.user?.profile?.nickname ?? 'Unknown',
        // 이미지가 있는 경우 enclosure 추가
        enclosure: post.images?.[0]?.path
          ? {
              url: post.images[0].path,
            }
          : undefined,
      });
    }

    // RSS 2.0 형식으로 XML 생성 (이 라이브러리는 기본적으로 rss 2.0을 사용)
    return feed.xml({ indent: true });
  }
}
