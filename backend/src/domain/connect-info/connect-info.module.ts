import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { ConnectInfo } from './connect-info.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([ConnectInfo])],
})
export class ConnectInfoModule {}
