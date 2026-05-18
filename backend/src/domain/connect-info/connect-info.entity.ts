import {
  Column,
  CreateTimestamp,
  Entity,
  PrimaryGeneratedColumn,
} from '@stingerloom/orm';

@Entity({ name: 'connect_info' })
export class ConnectInfo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  ip!: string;

  @Column({ type: 'varchar', length: 255 })
  userAgent!: string;

  @CreateTimestamp()
  createdAt!: Date;
}
