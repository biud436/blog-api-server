import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { SecondCategoryRepository } from './entities/second-category.repository';
import { SecondCategoryService } from './second-category.service';

@Module({
    imports: [TypeOrmModule.forFeature([SecondCategoryRepository])],
    providers: [SecondCategoryService],
    exports: [SecondCategoryService],
})
export class SecondCategoryModule {}
