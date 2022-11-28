import { Module } from '@nestjs/common';
import { CategoryGroupService } from './category-group.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryGroup } from './entities/category-group.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CategoryGroup])],
    providers: [CategoryGroupService],
    exports: [CategoryGroupService],
})
export class CategoryGroupModule {}
