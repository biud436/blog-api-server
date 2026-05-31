import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [StingerloomOrmModule.forFeature([User])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
