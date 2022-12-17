import { Module } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssController } from './rss.controller';

@Module({
    controllers: [RssController],
    providers: [RssService],
})
export class RssModule {}
