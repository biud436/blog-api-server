import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { CategoryGroup } from './category-group.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([CategoryGroup])],
})
export class CategoryGroupModule {}
