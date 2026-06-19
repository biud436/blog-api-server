import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ImageController } from './image.controller';
import { ImageModule as DomainImageModule } from 'src/domain/image/image.module';
import { UserModule } from 'src/domain/user/user.module';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { ImageCreateSvgCommandImpl } from './commands/image-create-svg.command';

@Module({
  imports: [
    DomainImageModule,
    UserModule,
    HttpModule,
    ConfigModule,
    MicroServicesModule,
  ],
  controllers: [ImageController],
  providers: [ImageCreateSvgCommandImpl],
  exports: [DomainImageModule],
})
export class ImageModule {}
