import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from './entities/profile.entity';
import { ProfileService } from './profile.service';
import { PaginationModule } from 'src/common/modules/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Profile]), PaginationModule],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
