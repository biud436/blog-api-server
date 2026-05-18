import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationColumn,
} from "@stingerloom/orm";
import { User } from "./user.entity";

@Entity({ name: "blog_meta_data" })
export class BlogMetaData {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  siteName!: string;

  @Column({ type: "varchar", length: 255 })
  githubUrl!: string;

  @Column({ type: "int", name: "user_id" })
  userId!: number;

  @ManyToOne(() => User, (user) => user.blogMetaData)
  @RelationColumn({ name: "user_id" })
  user!: User;
}
