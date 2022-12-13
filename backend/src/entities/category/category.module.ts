import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { SlackModule } from 'src/modules/slack/slack.module';

@Module({
    imports: [TypeOrmModule.forFeature([Category]), SlackModule],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule {}
