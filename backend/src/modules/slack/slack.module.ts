import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { SlackDecorator } from './slack.decorator';
import { SlackLogger } from './slack.logger';

@Module({
    imports: [HttpModule],
    providers: [SlackDecorator, SlackLogger],
})
export class SlackModule {}
