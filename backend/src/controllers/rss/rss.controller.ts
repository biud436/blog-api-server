import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Header,
    CacheKey,
    CacheTTL,
    UseInterceptors,
    CacheInterceptor,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomApiOkResponse } from 'src/common/decorators/custom.decorator';
import { RssService } from './rss.service';

@Controller('rss')
@UseInterceptors(CacheInterceptor)
@ApiTags('rss')
export class RssController {
    constructor(private readonly rssService: RssService) {}

    @Get()
    @Header('Content-Type', 'text/xml;charset=UTF-8')
    @CacheKey('rss')
    @CacheTTL(10)
    @CustomApiOkResponse({
        description: 'RSS 피드를 반환합니다.',
        operation: {
            summary: 'RSS 피드를 반환합니다.',
        },
    })
    async getFeeds() {
        return this.rssService.getFeeds();
    }
}
