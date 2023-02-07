import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectInfoService } from './connect-info.service';
import { ConnectInfo } from './entities/connect-info.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ConnectInfo])],
    providers: [ConnectInfoService],
    exports: [ConnectInfoService],
})
export class ConnectInfoModule {}
