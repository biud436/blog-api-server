import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageModule } from 'src/controllers/image/image.module';
import { OrmModule } from 'src/modules/orm/orm.module';
import { UserSubscriber } from './user.subscriber';
import { UserService } from './user.service';
import { UserRepository } from './entities/user.repository';

@Module({
    imports: [TypeOrmModule.forFeature([UserRepository]), ImageModule],
    providers: [UserService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
