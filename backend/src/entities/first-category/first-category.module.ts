import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirstCategoryService } from './first-category.service';

@Module({
    providers: [FirstCategoryService],
})
export class FirstCategoryModule {}
