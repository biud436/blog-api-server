import { User } from 'src/entities/user/entities/user.entity';
import * as orm from 'typeorm';
import { JoinColumn, OneToOne } from 'typeorm';

@orm.Entity()
export class Admin {
  @orm.PrimaryGeneratedColumn()
  id: number;

  @orm.Column()
  userId: number;

  @orm.OneToOne(() => User)
  @orm.JoinColumn()
  user: User;

  @orm.CreateDateColumn()
  createdAt: Date;

  @orm.UpdateDateColumn()
  updatedAt: Date;
}
