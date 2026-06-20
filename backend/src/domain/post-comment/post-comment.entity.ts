import {
  Column,
  CreateTimestamp,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationColumn,
  UpdateTimestamp,
} from "@stingerloom/orm";
import { Post } from "../post/post.entity";
import { User } from "../user/user.entity";

@Entity({ name: "post_comment" })
export class PostComment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int", name: "post_id" })
  postId!: number;

  @Column({ type: "int", name: "user_id" })
  userId!: number;

  @Column({ type: "varchar", length: 255 })
  content!: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @RelationColumn({ name: "post_id" })
  post!: Post;

  @ManyToOne(() => User, (user) => user.comments)
  @RelationColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "int", name: "parent_id", nullable: true })
  parentId?: number;

  @Column({ type: "int", name: "pos", default: 0 })
  pos!: number;

  @Column({ type: "int", name: "depth", default: 0 })
  depth!: number;

  @CreateTimestamp()
  createdAt!: Date;

  @UpdateTimestamp()
  updatedAt!: Date;

  @Column({ type: "datetime", nullable: true, default: null })
  deletedAt?: Date;
}
