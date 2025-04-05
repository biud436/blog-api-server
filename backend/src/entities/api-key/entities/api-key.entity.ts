import {
  Expose,
  plainToClass,
  Transform,
  TransformFnParams,
} from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';
import * as moment from 'moment';
import { User } from 'src/entities/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class ApiKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    unique: true,
    length: 191,
  })
  accessKey!: string;

  @Column({
    name: 'scope',
    default: 'read:write:update:delete',
  })
  @Transform((param) => {
    if (!param.value) return [];
    if (typeof param.value === 'string') {
      return param.value.split(':');
    }
    return param.value;
  })
  scope!: string;

  @Column()
  isExpired!: boolean;

  @Column({
    type: 'datetime',
  })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({
    name: 'user_id',
  })
  userId!: number;

  @ManyToOne(() => User, (user) => user.apiKeys, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<User>;

  @Expose()
  get key() {
    const KEY = this.accessKey ?? '';
    const WHILDCARD = KEY.slice(8, KEY.length - 8).replace(/./g, '*');

    return KEY.slice(0, 8) + WHILDCARD;
  }

  static of(
    data: Omit<Partial<ApiKey>, 'expiresAt'> & {
      expiresAt: Date;
    },
  ): ApiKey {
    const instance = plainToClass(ApiKey, data);
    return instance;
  }
}
