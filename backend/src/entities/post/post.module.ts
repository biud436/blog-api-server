import { forwardRef, Module } from '@nestjs/common';
import { PostService } from './post.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { MicroServicesModule } from 'src/micro-services/micro-services.module';
import { ImageModule } from 'src/controllers/image/image.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Post]),
        forwardRef(() => ImageModule),
        MicroServicesModule,
    ],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
