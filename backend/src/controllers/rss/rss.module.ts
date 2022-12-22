import { Module } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssController } from './rss.controller';
import { PostsModule } from '../posts/posts.module';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [PostsModule, ConfigModule],
    controllers: [RssController],
    providers: [RssService],
})
export class RssModule {}
