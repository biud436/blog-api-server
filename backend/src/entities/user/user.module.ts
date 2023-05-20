import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageModule } from 'src/controllers/image/image.module';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UserSubscriber } from './user.subscriber';
import { PaginationModule } from 'src/common/modules/pagination/pagination.module';

@Module({
    imports: [TypeOrmModule.forFeature([User]), PaginationModule],
    providers: [UserService, UserSubscriber],
    exports: [UserService],
})
export class UserModule {}
