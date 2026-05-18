import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationColumn,
} from '@stingerloom/orm';
import { Post } from '../post/post.entity';

@Entity({ name: 'image' })
export class Image {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  originalname!: string;

  @Column({ type: 'varchar', length: 255 })
  encoding!: string;

  @Column({ type: 'varchar', length: 255 })
  mimetype!: string;

  @Column({ type: 'varchar', length: 255 })
  destination!: string;

  @Column({ type: 'varchar', length: 256 })
  filename!: string;

  @Column({ type: 'varchar', length: 256 })
  path!: string;

  @Column({ type: 'int' })
  size!: number;

  @Column({ type: 'int', name: 'post_id', nullable: true })
  postId!: number;

  @ManyToOne(() => Post, (post) => post.images, {
    createForeignKeyConstraints: false,
  })
  @RelationColumn({ name: 'post_id', nullable: true })
  post!: Post;
}
