import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from 'src/domain/image/entities/image.repository';
import { AdminRepository } from 'src/entities/admin/entities/admin.repository';
import { PostRepository } from 'src/entities/post/entities/post.repository';
import { ProfileRepository } from 'src/entities/profile/entities/profile.repository';
import { UserRepository } from 'src/entities/user/entities/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminRepository,
      PostRepository,
      ProfileRepository,
      UserRepository,
      ImageRepository,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class OrmModule {}
