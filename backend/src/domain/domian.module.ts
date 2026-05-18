import { Module } from "@nestjs/common";
import { StingerloomOrmModule } from "@stingerloom/orm/nestjs";
import { Admin } from "./admin/admin.entity";
import { ApiKey } from "./api-key.entity";
import { BlogMetaData } from "./blog-meta-data.entity";
import { CategoryGroup } from "./category-group.entity";
import { Category } from "./category.entity";
import { ConnectInfo } from "./connect-info.entity";
import { Image } from "./image.entity";
import { PostComment } from "./post-comment.entity";
import { PostViewCount } from "./post-view-count.entity";
import { Post } from "./post.entity";
import { Profile } from "./profile.entity";
import { User } from "./user.entity";

@Module({
  imports: [StingerloomOrmModule.forFeature([
    ApiKey,
    BlogMetaData,
    CategoryGroup,
    Category,
    ConnectInfo,
    Image,
    Post,
    PostComment,
    PostViewCount,
    User,
    Profile,
  ])],
})
export class DomainModule {}