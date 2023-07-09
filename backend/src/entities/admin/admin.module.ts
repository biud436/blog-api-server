import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Admin])],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}
