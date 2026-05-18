import {
  Column,
  CreateTimestamp,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationColumn,
  UniqueIndex,
} from '@stingerloom/orm';
import { Admin } from '../admin/admin.entity';
import { ApiKey } from '../api-key/api-key.entity';
import { BlogMetaData } from '../blog-meta-data/blog-meta-data.entity';
import { Post } from '../post/post.entity';
import { PostComment } from '../post-comment/post-comment.entity';
import { Profile } from '../profile/profile.entity';

@Entity({ name: 'user' })
@UniqueIndex(['username'])
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  username!: string;

  @Column({ type: 'int', name: 'profile_id' })
  profileId!: number;

  @Column({ type: 'boolean', default: true })
  isValid!: boolean;

  @OneToOne(() => Profile, {
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  })
  @RelationColumn({ name: 'profile_id' })
  profile!: Profile;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @CreateTimestamp()
  createdAt!: Date;

  @CreateTimestamp()
  updatedAt!: Date;

  @OneToMany(() => Post, { mappedBy: 'user' })
  posts!: Post[];

  @OneToMany(() => Admin, { mappedBy: 'user' })
  admins!: Admin[];

  @OneToMany(() => ApiKey, { mappedBy: 'user' })
  apiKeys!: ApiKey[];

  @OneToMany(() => BlogMetaData, { mappedBy: 'user' })
  blogMetaData!: BlogMetaData[];

  @OneToMany(() => PostComment, { mappedBy: 'user' })
  comments!: PostComment[];
}
