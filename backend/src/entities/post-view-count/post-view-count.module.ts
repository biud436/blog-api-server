import { Module } from '@nestjs/common';
import { PostViewCountService } from './post-view-count.service';

@Module({
    providers: [PostViewCountService],
})
export class PostViewCountModule {}
