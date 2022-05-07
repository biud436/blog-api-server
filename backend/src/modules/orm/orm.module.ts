import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageRepository } from 'src/domain/image/entities/image.repository';
import { AdminRepository } from 'src/entities/admin/entities/admin.repository';
import { FirstCategoryRepository } from 'src/entities/first-category/entities/first-category.repository';
import { PostViewCountRepository } from 'src/entities/post-view-count/entities/post-view-count.repository';
import { PostRepository } from 'src/entities/post/entities/post.repository';
import { ProfileRepository } from 'src/entities/profile/entities/profile.repository';
import { SecondCategoryRepository } from 'src/entities/second-category/entities/second-category.repository';
import { UserRepository } from 'src/entities/user/entities/user.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            AdminRepository,
            PostRepository,
            ProfileRepository,
            UserRepository,
            ImageRepository,
            FirstCategoryRepository,
            SecondCategoryRepository,
            PostViewCountRepository,
        ]),
    ],
    exports: [TypeOrmModule],
})
export class OrmModule {}
