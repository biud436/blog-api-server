import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { PostViewCount } from 'src/entities/post-view-count/entities/post-view-count.entity';
import { PostViewCountService } from 'src/entities/post-view-count/post-view-count.service';
import { DataSource } from 'typeorm';

@Injectable()
export class TaskService implements OnModuleInit {
    private readonly logger = new Logger(TaskService.name);

    constructor(
        private readonly redisService: RedisService,
        private readonly postViewCountService: PostViewCountService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        // empty
    }

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handlePostViewCount() {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log('Start handlePostViewCount...');

        try {
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

            await queryRunner.commitTransaction();
        } catch (e: any) {
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }

        this.logger.log('End handlePostViewCount...');
    }
}
