import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { FirstCategoryRepository } from './entities/first-category.repository';
import { FirstCategoryService } from './first-category.service';

@Module({
    imports: [TypeOrmModule.forFeature([FirstCategoryRepository])],
    providers: [FirstCategoryService],
    exports: [FirstCategoryService],
})
export class FirstCategoryModule {}
