import { Inject, Injectable } from '@nestjs/common';
import { Feed } from 'feed'; // feed 라이브러리 임포트
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

    // Feed 인스턴스 생성
    const feed = new Feed({
      title: title,
      description: description,
      id: site_url,
      link: site_url,
      language: 'ko',
      favicon: `${site_url}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}`,
      updated: new Date(),
      feedLinks: {
        rss: `${site_url}/rss`,
      },
      author: {
        name: author,
        link: site_url,
      },
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

      feed.addItem({
        title: post.title,
        id: `${postUrl}/${post.id}`,
        link: `${postUrl}/${post.id}`,
        description: safeDescription,
        date: post.uploadDate,
        author: [
          {
            name: author ?? post.user?.profile?.nickname ?? 'Unknown',
            link: site_url,
          },
        ],
      });
    }

    // RSS 2.0 형식으로 반환
    return feed.rss2();
  }
}
