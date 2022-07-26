import { Module } from '@nestjs/common';
import { OrmModule } from 'src/modules/orm/orm.module';
import { FirstCategoryService } from './first-category.service';

@Module({
    imports: [OrmModule],
    providers: [FirstCategoryService],
    exports: [FirstCategoryService],
})
export class FirstCategoryModule {}
