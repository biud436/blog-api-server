import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from 'src/entities/post/entities/post.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PostRepository])],
  exports: [TypeOrmModule],
})
export class OrmModule {}
