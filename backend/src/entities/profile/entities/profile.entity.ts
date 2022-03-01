import * as typeorm from 'typeorm';

@typeorm.Entity()
export class Profile {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column({
    unique: true,
    length: 100,
  })
  email: string;

  @typeorm.CreateDateColumn()
  createdAt: Date;

  @typeorm.UpdateDateColumn()
  updatedAt: Date;
}
