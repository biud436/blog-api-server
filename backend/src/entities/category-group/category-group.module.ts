import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroup } from './entities/category-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoryGroup])],
})
export class CategoryGroupModule {}
