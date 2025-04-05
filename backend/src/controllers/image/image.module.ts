import { forwardRef, Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/image.entity';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/entities/user/user.module';
import { MicroServicesModule } from 'src/common/micro-services/micro-services.module';
import { ImageCreateCommandImpl } from './commands/image-create.command';
import { ImageTempFileGetterCommandImpl } from './commands/image-temp.command';
import { ImageFindByIdCommandImpl } from './commands/image-find-by-id.command';
import { ImageUpdatePostIdCommandImpl } from './commands/image-update-post-id.command';
import { ImageUploadCommandImpl } from './commands/image-upload.command';
import { ImageDeleteCommandImpl } from './commands/image-delete.command';
import { ImageCreateSvgCommandImpl } from './commands/image-create-svg.command';

@Module({
  imports: [
    TypeOrmModule.forFeature([Image]),
    HttpModule,
    forwardRef(() => UserModule),
    ConfigModule,
    MicroServicesModule,
  ],
  controllers: [ImageController],
  providers: [
    ImageCreateSvgCommandImpl,
    ImageTempFileGetterCommandImpl,
    ImageFindByIdCommandImpl,
    ImageUpdatePostIdCommandImpl,
    ImageUploadCommandImpl,
    ImageDeleteCommandImpl,
    ImageCreateCommandImpl,
    ImageService,
    // {
    //     provide: ImageCreateCommand,
    //     useClass: ImageCreateCommandImpl,
    // },
    // {
    //     provide: ImageTempFileGetterCommand,
    //     useClass: ImageTempFileGetterCommandImpl,
    // },
    // {
    //     provide: ImageFindByIdCommand,
    //     useClass: ImageFindByIdCommandImpl,
    // },
    // {
    //     provide: ImageUpdatePostIdCommand,
    //     useClass: ImageUpdatePostIdCommandImpl,
    // },
    // {
    //     provide: ImageUploadCommand,
    //     useClass: ImageUploadCommandImpl,
    // },
    // {
    //     provide: ImageDeleteCommand,
    //     useClass: ImageDeleteCommandImpl,
    // },
    // {
    //     provide: ImageCreateSvgCommand,
    //     useClass: ImageCreateSvgCommandImpl,
    // },
  ],
  exports: [ImageService],
})
export class ImageModule {}
