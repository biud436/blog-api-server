import { Module } from '@nestjs/common';
import { SecondCategoryService } from './second-category.service';

@Module({
    providers: [SecondCategoryService],
})
export class SecondCategoryModule {}
