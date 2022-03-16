import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { UserRepository } from './entities/user.repository';
import { UserService } from './user.service';

@Module({
  imports: [OrmModule],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
