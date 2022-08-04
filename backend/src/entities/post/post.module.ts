import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from './entities/post.repository';
import { OrmModule } from 'src/modules/orm/orm.module';
import { Post } from './entities/post.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PostRepository])],
    providers: [PostService],
    exports: [PostService],
})
export class PostModule {}
