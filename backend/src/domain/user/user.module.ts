import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { User } from './user.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([User])],
})
export class UserModule {}
