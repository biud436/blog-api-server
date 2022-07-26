import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { ProfileRepository } from './entities/profile.repository';
import { ProfileService } from './profile.service';

@Module({
    imports: [OrmModule],
    providers: [ProfileService],
    exports: [ProfileService],
})
export class ProfileModule {}
