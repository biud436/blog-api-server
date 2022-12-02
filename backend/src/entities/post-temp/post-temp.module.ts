import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostTemp } from './entities/post-temp.entity';
import { PostTempService } from './post-temp.service';
import { PostTempSubscriber } from './post-temp.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([PostTemp])],
    providers: [PostTempService, PostTempSubscriber],
    exports: [PostTempService],
})
export class PostTempModule {}
