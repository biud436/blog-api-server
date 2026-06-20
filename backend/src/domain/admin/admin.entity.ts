import {
  Column,
  CreateTimestamp,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationColumn,
  UpdateTimestamp,
} from "@stingerloom/orm";
import { User } from "../user/user.entity";

@Entity({ name: "admin" })
export class Admin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "int" })
  userId!: number;

  @ManyToOne(() => User, (user) => user.admins, {
    onDelete: "RESTRICT",
    onUpdate: "RESTRICT",
  })
  @RelationColumn({ name: "user_id" })
  user!: User;

  @CreateTimestamp()
  createdAt!: Date;

  @UpdateTimestamp()
  updatedAt!: Date;
}
