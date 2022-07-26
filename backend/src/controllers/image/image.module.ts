import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { OrmModule } from 'src/modules/orm/orm.module';

@Module({
    imports: [OrmModule],
    controllers: [ImageController],
    providers: [ImageService],
})
export class ImageModule {}
