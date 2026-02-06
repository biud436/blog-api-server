import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { TypeOrmExModule } from 'src/common/modules/typeorm-ex/typeorm-ex.module';
import { CategoryRepository } from './entities/category.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category]),
    TypeOrmExModule.forCustomRepository([CategoryRepository]),
  ],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
