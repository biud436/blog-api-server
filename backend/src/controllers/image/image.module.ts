import { forwardRef, Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/entities/user/user.module';
import { AesModule } from 'src/modules/aes/aes.module';
import { MicroServicesModule } from 'src/micro-services/micro-services.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Image]),
        HttpModule,
        forwardRef(() => UserModule),
        ConfigModule,
        MicroServicesModule,
    ],
    controllers: [ImageController],
    providers: [ImageService],
})
export class ImageModule {}
