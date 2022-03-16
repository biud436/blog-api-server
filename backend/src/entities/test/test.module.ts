import { Module } from '@nestjs/common';
import { TestService } from './test.service';
import { TestController } from './test.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepositoryModule } from '../post/post.module';

@Module({
  imports: [PostRepositoryModule],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
