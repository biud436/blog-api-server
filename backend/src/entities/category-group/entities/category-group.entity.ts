import { Category } from 'src/entities/category/entities/category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CategoryGroup {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    name: 'CTGR_GRP_NM',
  })
  name!: string;

  @Column({
    name: 'CTGR_GRP_DESC',
  })
  description!: string;

  @OneToMany(() => Category, (category) => category.categoryGroup)
  categories!: Category[];
}
