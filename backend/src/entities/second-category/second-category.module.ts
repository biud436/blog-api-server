import { Module } from '@nestjs/common';
import { OrmModule } from 'src/modules/orm/orm.module';
import { SecondCategoryService } from './second-category.service';

@Module({
    imports: [OrmModule],
    providers: [SecondCategoryService],
    exports: [SecondCategoryService],
})
export class SecondCategoryModule {}
