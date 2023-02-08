import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/common/modules/orm/orm.module';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './entities/admin.repository';

@Module({
    imports: [TypeOrmModule.forFeature([Admin])],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule {}
