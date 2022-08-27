import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CategoryModule } from 'src/entities/category/category.module';

@Module({
    imports: [CategoryModule],
    controllers: [AdminController],
    providers: [AdminService],
})
export class AdminModule {}
