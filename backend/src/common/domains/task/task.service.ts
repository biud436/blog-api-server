import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Transactional } from '@stingerloom/orm';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { PostViewCount } from 'src/domain/post-view-count/post-view-count.entity';
import { PostViewCountService } from 'src/domain/post-view-count/post-view-count.service';

@Injectable()
export class TaskService implements OnModuleInit {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly postViewCountService: PostViewCountService,
    ) {}

    async onModuleInit() {
        // empty
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    @Transactional()
    async handlePostViewCount() {
        this.logger.log('Start handlePostViewCount...');

        const posts = await this.redisService.collectAllPostViewCount();
        const promisifyItems: Promise<PostViewCount>[] = [];

        for (const post of posts) {
            const { id, count } = post;

            promisifyItems.push(
                this.postViewCountService.create({
                    id,
                    count,
                }),
            );

            this.logger.log(`PostViewCount: ${id} - ${count}`);
        }

        await Promise.allSettled(promisifyItems);

        this.logger.log('End handlePostViewCount...');
    }
}
