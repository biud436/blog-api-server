import { Admin } from './admin/admin.entity';
import { ApiKey } from './api-key/api-key.entity';
import { BlogMetaData } from './blog-meta-data/blog-meta-data.entity';
import { Category } from './category/category.entity';
import { CategoryGroup } from './category-group/category-group.entity';
import { ConnectInfo } from './connect-info/connect-info.entity';
import { Image } from './image/image.entity';
import { Post } from './post/post.entity';
import { PostComment } from './post-comment/post-comment.entity';
import { PostViewCount } from './post-view-count/post-view-count.entity';
import { Profile } from './profile/profile.entity';
import { User } from './user/user.entity';

export const STINGERLOOM_DOMAIN_ENTITIES = [
  Admin,
  ApiKey,
  BlogMetaData,
  Category,
  CategoryGroup,
  ConnectInfo,
  Image,
  Post,
  PostComment,
  PostViewCount,
  Profile,
  User,
] as const;

export { Admin };
export { ApiKey };
export { BlogMetaData };
export { Category };
export { CategoryGroup };
export { ConnectInfo };
export { Image };
export { Post };
export { PostComment };
export { PostViewCount };
export { Profile };
export { User };
