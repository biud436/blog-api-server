import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { ConnectInfo } from './connect-info.entity';
import { ConnectInfoService } from './connect-info.service';

@Module({
  imports: [StingerloomOrmModule.forFeature([ConnectInfo])],
  providers: [ConnectInfoService],
  exports: [ConnectInfoService],
})
export class ConnectInfoModule {}
