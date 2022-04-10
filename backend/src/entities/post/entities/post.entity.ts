import { User } from 'src/entities/user/entities/user.entity';
import * as typeorm from 'typeorm';

@typeorm.Entity()
export class Post {
  @typeorm.PrimaryGeneratedColumn()
  id: number;

  /**
   * 작성자
   */
  authorId: number;

  /**
   * 제목
   */
  @typeorm.Column()
  title: string;

  /**
   * 상세 내용
   */
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

  @typeorm.OneToOne(() => User, {
    onUpdate: 'RESTRICT',
    onDelete: 'RESTRICT',
  })
  @typeorm.JoinColumn({
    name: 'author_id',
  })
  user: User;

  /**
   * Build Post entity.
   * @returns
   */
  static build(): Omit<Post, 'id' | 'user'> {
    const post = new Post();
    const { id, user, ...otherValues } = post;

    return otherValues;
  }
}
