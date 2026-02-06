import { forwardRef, Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { CategoryModule } from 'src/entities/category/category.module';
import { UserModule } from 'src/entities/user/user.module';

@Module({
  imports: [CategoryModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
