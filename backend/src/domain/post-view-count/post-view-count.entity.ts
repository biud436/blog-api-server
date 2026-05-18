import {
  Column,
  CreateTimestamp,
  Entity,
  PrimaryGeneratedColumn,
  UpdateTimestamp,
} from '@stingerloom/orm';

@Entity({ name: 'post_view_count' })
export class PostViewCount {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateTimestamp()
  createdAt!: Date;

  @UpdateTimestamp()
  updatedAt!: Date;

  @Column({ type: 'int', default: 0 })
  count!: number;
}
