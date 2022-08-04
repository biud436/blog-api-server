import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { OrmModule } from 'src/modules/orm/orm.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from './entities/image.repository';

@Module({
    imports: [TypeOrmModule.forFeature([ImageRepository])],
    controllers: [ImageController],
    providers: [ImageService],
})
export class ImageModule {}
