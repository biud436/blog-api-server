import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { Category } from '../category/category.entity';
import { Image } from '../image/image.entity';
import { ImageModule } from '../image/image.module';
import { Post } from './post.entity';
import { PostService } from './post.service';
import { PostSubscriber } from './post.subscriber';

@Module({
  imports: [
    StingerloomOrmModule.forFeature([Post, Image, Category]),
    MicroServicesModule,
    ImageModule,
  ],
  providers: [PostService, PostSubscriber],
  exports: [PostService],
})
export class PostModule {}
