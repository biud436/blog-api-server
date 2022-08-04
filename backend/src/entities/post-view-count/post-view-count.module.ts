import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrmModule } from 'src/modules/orm/orm.module';
import { PostViewCountRepository } from './entities/post-view-count.repository';
import { PostViewCountService } from './post-view-count.service';

@Module({
    imports: [TypeOrmModule.forFeature([PostViewCountRepository])],
    providers: [PostViewCountService],
    exports: [PostViewCountService],
})
export class PostViewCountModule {}
