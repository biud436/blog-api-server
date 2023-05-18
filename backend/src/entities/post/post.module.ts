import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { ImageModule } from 'src/controllers/image/image.module';
import { CategoryModule } from '../category/category.module';
import { PostSubscriber } from './post.subscriber';
import { PaginationModule } from 'src/common/modules/pagination/pagination.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Post]),
        forwardRef(() => ImageModule),
        MicroServicesModule,
        CategoryModule,
        PaginationModule,
    ],
    providers: [PostService, PostSubscriber],
    exports: [PostService],
})
export class PostModule {}
