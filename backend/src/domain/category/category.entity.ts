import {
  Column,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationColumn,
} from '@stingerloom/orm';
import { CategoryGroup } from '../category-group/category-group.entity';
import { Post } from '../post/post.entity';

@Entity({ name: 'category' })
export class Category {
  @PrimaryGeneratedColumn({ name: 'CTGR_SQ' })
  id!: number;

  @Column({ type: 'varchar', length: 255, name: 'CTGR_NM' })
  @Index()
  name!: string;

  @Column({ type: 'int', name: 'LFT_NO' })
  left!: number;

  @Column({ type: 'int', name: 'RGT_NO' })
  right!: number;

  @Column({ type: 'int', name: 'CTGR_GRP_SQ', default: 1 })
  groupId!: number;

  @ManyToOne(() => CategoryGroup, (categoryGroup) => categoryGroup.categories)
  @RelationColumn({ name: 'CTGR_GRP_SQ' })
  categoryGroup!: CategoryGroup;

  @OneToMany(() => Post, { mappedBy: 'category' })
  posts!: Post[];
}
