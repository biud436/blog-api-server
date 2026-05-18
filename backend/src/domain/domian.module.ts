import { Module } from "@nestjs/common";
import { AdminModule } from "./admin/admin.module";
import { ApiKeyModule } from "./api-key/api-key.module";
import { BlogMetaDataModule } from "./blog-meta-data/blog-meta-data.module";
import { CategoryModule } from "./category/category.module";
import { CategoryGroupModule } from "./category-group/category-group.module";
import { ConnectInfoModule } from "./connect-info/connect-info.module";
import { ImageModule } from "./image/image.module";
import { PostModule } from "./post/post.module";
import { PostCommentModule } from "./post-comment/post-comment.module";
import { PostViewCountModule } from "./post-view-count/post-view-count.module";
import { ProfileModule } from "./profile/profile.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    AdminModule,
    ApiKeyModule,
    BlogMetaDataModule,
    CategoryModule,
    CategoryGroupModule,
    ConnectInfoModule,
    ImageModule,
    PostModule,
    PostCommentModule,
    PostViewCountModule,
    ProfileModule,
    UserModule,
  ],
})
export class DomainModule {}
