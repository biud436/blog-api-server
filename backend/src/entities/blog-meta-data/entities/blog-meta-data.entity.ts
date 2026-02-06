import { User } from 'src/entities/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

@Entity()
export class BlogMetaData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  siteName!: string;

  @Column()
  githubUrl!: string;

  @Column({
    name: 'user_id',
  })
  userId!: number;

  @ManyToOne(() => User, (user) => user.blogMetaData)
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;
}
