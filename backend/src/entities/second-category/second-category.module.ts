import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { SecondCategory } from './entities/second-category.entity';
import { SecondCategoryService } from './second-category.service';

@Module({
    imports: [TypeOrmModule.forFeature([SecondCategory])],
    providers: [SecondCategoryService],
    exports: [SecondCategoryService],
})
export class SecondCategoryModule {}
