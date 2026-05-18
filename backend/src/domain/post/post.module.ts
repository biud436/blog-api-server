import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { Post } from './post.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([Post])],
})
export class PostModule {}
