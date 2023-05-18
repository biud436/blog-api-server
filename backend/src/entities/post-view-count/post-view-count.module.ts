import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostViewCount } from './entities/post-view-count.entity';
import { PostViewCountService } from './post-view-count.service';

@Module({
    imports: [TypeOrmModule.forFeature([PostViewCount])],
    providers: [PostViewCountService],
    exports: [PostViewCountService],
})
export class PostViewCountModule {}
