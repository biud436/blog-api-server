import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { Profile } from './profile.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([Profile])],
})
export class ProfileModule {}
