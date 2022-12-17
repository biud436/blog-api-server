import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { RssService } from './rss.service';

@Controller('rss')
export class RssController {
    constructor(private readonly rssService: RssService) {}
}
