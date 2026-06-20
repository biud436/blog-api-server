import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { PostViewCount } from './post-view-count.entity';
import { PostViewCountService } from './post-view-count.service';

@Module({
  imports: [StingerloomOrmModule.forFeature([PostViewCount])],
  providers: [PostViewCountService],
  exports: [PostViewCountService],
})
export class PostViewCountModule {}
