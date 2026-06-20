import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from '@stingerloom/orm';
import { Category } from '../category/category.entity';

@Entity({ name: 'category_group' })
export class CategoryGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, name: 'CTGR_GRP_NM' })
  name!: string;

  @Column({ type: 'varchar', length: 255, name: 'CTGR_GRP_DESC' })
  description!: string;

  @OneToMany(() => Category, { mappedBy: 'categoryGroup' })
  categories!: Category[];
}
