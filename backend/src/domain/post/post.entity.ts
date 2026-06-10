import {
  Column,
  CreateTimestamp,
  DeletedAt,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationColumn,
  UpdateTimestamp,
} from '@stingerloom/orm';
import { Category } from '../category/category.entity';
import { Image } from '../image/image.entity';
import { PostComment } from '../post-comment/post-comment.entity';
import { User } from '../user/user.entity';

@Entity({ name: 'post' })
export class Post {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int', name: 'author_id' })
  authorId!: number;

  @Column({ type: 'int', name: 'category_id' })
  categoryId!: number;

  @Column({ type: 'boolean', default: false })
  @Index()
  isPrivate!: boolean;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  /** 컬럼이 아님 — afterLoad/withPreview 에서 markdown 제거 후 채워지는 파생 필드 */
  previewContent?: string;

  @CreateTimestamp()
  uploadDate!: Date;

  @UpdateTimestamp()
  updatedAt!: Date;

  @DeletedAt()
  deletedAt!: Date | null;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    fkProperty: 'authorId',
  })
  @RelationColumn({ name: 'author_id' })
  user!: User;

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @RelationColumn({ name: 'category_id' })
  category!: Category;

  @OneToMany(() => PostComment, { mappedBy: 'post' })
  comments!: PostComment[];

  @OneToMany(() => Image, { mappedBy: 'post' })
  images!: Image[];
}
