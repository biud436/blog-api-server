import * as typeorm from 'typeorm';

@typeorm.Entity()
export class Post {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  @typeorm.Column()
  title: string;

  @typeorm.Column()
  content: string;

  @typeorm.Column()
  uploadDate: Date;

  @typeorm.UpdateDateColumn()
  updatedAt: Date;

  @typeorm.DeleteDateColumn({
    nullable: true,
  })
  deletedAt: Date;
}
