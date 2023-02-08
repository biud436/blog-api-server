import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { OrmModule } from 'src/common/modules/orm/orm.module';
import { PostViewCount } from './entities/post-view-count.entity';
import { PostViewCountService } from './post-view-count.service';

@Module({
    imports: [TypeOrmModule.forFeature([PostViewCount])],
    providers: [PostViewCountService],
    exports: [PostViewCountService],
})
export class PostViewCountModule {}
