import { Controller, Get, Header } from '@nestjs/common';
import { RssService } from './rss.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { ApiNotebook } from 'src/common/decorators/swagger';
import { ApiTags } from '@nestjs/swagger';

@Controller('rss')
@ApiTags('RSS')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  /**
   * RSS 피드를 생성합니다.
   *
   * @tag RSS
   */
  @Get()
  @Header('Content-Type', 'application/xml; charset=utf-8')
  // @Header('Content-Type', 'application/rss+xml; charset=utf-8')
  @CacheTTL(10)
  @ApiNotebook({
    operation: {
      summary: 'RSS 피드 생성',
      description: 'RSS 피드를 생성합니다.',
    },
  })
  async getFeeds() {
    return this.rssService.getFeeds();
  }
}
