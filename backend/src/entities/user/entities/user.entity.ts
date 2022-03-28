import { Profile } from 'src/entities/profile/entities/profile.entity';
import * as typeorm from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Post } from 'src/entities/post/entities/post.entity';
import { Exclude } from 'class-transformer';

@typeorm.Entity()
export class User {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column()
  username: string;

  @typeorm.Column({
    name: 'profile_id',
  })
  profileId: number;

  @typeorm.Column({
    default: true,
  })
  isValid: boolean;

  @typeorm.OneToOne(() => Profile, {
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  })
  @typeorm.JoinColumn({
    name: 'profile_id',
  })
  profile: Profile;

  @typeorm.Column()
  @Exclude()
  password: string;

  async hashPassword(password: string) {
    this.password = await bcrypt.hash(password, 10);
  }

  @typeorm.BeforeInsert()
  async savePassword() {
    await this.hashPassword(this.password);
  }

  @typeorm.CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @typeorm.CreateDateColumn({
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
