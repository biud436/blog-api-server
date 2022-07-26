import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserCopy } from './entities/user-copy.entity';
import { UserCopyService } from './user-copy.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserCopy])],
    providers: [UserCopyService],
    exports: [UserCopyService],
})
export class UserCopyModule {}
