import { Module } from '@nestjs/common';
import { StingerloomOrmModule } from '@stingerloom/orm/nestjs';
import { Image } from './image.entity';

@Module({
  imports: [StingerloomOrmModule.forFeature([Image])],
})
export class ImageModule {}
