import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConnectInfoService } from './connect-info.service';
import { ConnectInfo } from './entities/connect-info.entity';
import { PaginationModule } from 'src/common/modules/pagination/pagination.module';

@Module({
    imports: [TypeOrmModule.forFeature([ConnectInfo]), PaginationModule],
    providers: [ConnectInfoService],
    exports: [ConnectInfoService],
})
export class ConnectInfoModule {}
