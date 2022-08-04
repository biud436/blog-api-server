import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { FirstCategory } from './entities/first-category.entity';
import { FirstCategoryService } from './first-category.service';

@Module({
    imports: [TypeOrmModule.forFeature([FirstCategory])],
    providers: [FirstCategoryService],
    exports: [FirstCategoryService],
})
export class FirstCategoryModule {}
