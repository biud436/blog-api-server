import { Module } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './entities/department.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Department])],
    providers: [DepartmentService],
})
export class DepartmentModule {}
