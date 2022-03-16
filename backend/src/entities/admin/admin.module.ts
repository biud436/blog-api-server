import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { AdminService } from './admin.service';
import { AdminRepository } from './entities/admin.repository';

@Module({
  imports: [OrmModule],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
