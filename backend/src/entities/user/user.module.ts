import { Module } from '@nestjs/common';
import { ImageModule } from 'src/controllers/image/image.module';
import { OrmModule } from 'src/modules/orm/orm.module';
import { UserService } from './user.service';

@Module({
    imports: [OrmModule, ImageModule],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
