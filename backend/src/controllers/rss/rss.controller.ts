import { Controller, Get, Header, CacheTTL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RssService } from './rss.service';

@Controller('rss')
export class RssController {
    constructor(private readonly rssService: RssService) {}

    /**
     * RSS 피드를 생성합니다.
     *
     * @tag RSS
     */
    @Get()
    @Header('Content-Type', 'text/xml;charset=UTF-8')
    @CacheTTL(10)
    async getFeeds() {
        return this.rssService.getFeeds();
    }
}
