import { Module } from '@nestjs/common';
import { OrmModule } from 'src/modules/orm/orm.module';
import { PostViewCountService } from './post-view-count.service';

@Module({
    imports: [OrmModule],
    providers: [PostViewCountService],
    exports: [PostViewCountService],
})
export class PostViewCountModule {}
