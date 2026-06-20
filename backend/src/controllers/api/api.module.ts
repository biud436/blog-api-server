import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthModule } from '../auth/auth.module';
import { ApiService } from './api.service';
import { PostModule } from 'src/domain/post/post.module';

@Module({
  imports: [AuthModule, PostModule],
  controllers: [ApiController],
  providers: [ApiService],
  exports: [ApiService],
})
export class ApiModule {}
