import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { Category } from './category.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([Category])],
})
export class CategoryModule {}
