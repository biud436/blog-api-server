import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { PostViewCount } from './post-view-count.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([PostViewCount])],
})
export class PostViewCountModule {}
