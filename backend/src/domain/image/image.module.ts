import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { UserModule } from '../user/user.module';
import { Image } from './image.entity';
import { ImageService } from './image.service';

@Module({
  imports: [
    StingerloomOrmModule.forFeature([Image]),
    MicroServicesModule,
    UserModule,
  ],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
