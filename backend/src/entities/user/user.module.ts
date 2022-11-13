import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageModule } from 'src/controllers/image/image.module';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSubscriber } from './user.subscriber';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [UserService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
