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
import {
    ImageCreateCommand,
    ImageCreateCommandImpl,
} from './commands/image-create.command';
import {
    ImageTempFileGetterCommand,
    ImageTempFileGetterCommandImpl,
} from './commands/image-temp.command';
import {
    ImageFindByIdCommand,
    ImageFindByIdCommandImpl,
} from './commands/image-find-by-id.command';
import {
    ImageUpdatePostIdCommand,
    ImageUpdatePostIdCommandImpl,
} from './commands/image-update-post-id.command';
import {
    ImageUploadCommand,
    ImageUploadCommandImpl,
} from './commands/image-upload.command';
import {
    ImageDeleteCommand,
    ImageDeleteCommandImpl,
} from './commands/image-delete.command';

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
        ImageService,
        {
            provide: ImageCreateCommand,
            useClass: ImageCreateCommandImpl,
        },
        {
            provide: ImageTempFileGetterCommand,
            useClass: ImageTempFileGetterCommandImpl,
        },
        {
            provide: ImageFindByIdCommand,
            useClass: ImageFindByIdCommandImpl,
        },
        {
            provide: ImageUpdatePostIdCommand,
            useClass: ImageUpdatePostIdCommandImpl,
        },
        {
            provide: ImageUploadCommand,
            useClass: ImageUploadCommandImpl,
        },
        {
            provide: ImageDeleteCommand,
            useClass: ImageDeleteCommandImpl,
        },
    ],
    exports: [ImageService],
})
export class ImageModule {}
