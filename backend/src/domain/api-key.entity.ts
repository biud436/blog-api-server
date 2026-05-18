import {
  Column,
  CreateTimestamp,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationColumn,
  UniqueIndex,
  UpdateTimestamp,
} from "@stingerloom/orm";
import { User } from "./user.entity";

@Entity({ name: "api_key" })
@UniqueIndex(["access_key"])
export class ApiKey {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 191 })
  accessKey!: string;

  @Column({
    type: "varchar",
    length: 255,
    name: "scope",
    default: "read:write:update:delete",
  })
  scope!: string;

  @Column({ type: "boolean" })
  isExpired!: boolean;

  @Column({ type: "datetime" })
  expiresAt!: Date;

  @CreateTimestamp()
  createdAt!: Date;

  @UpdateTimestamp()
  updatedAt!: Date;

  @Column({ type: "int", name: "user_id" })
  userId!: number;

  @ManyToOne(() => User, (user) => user.apiKeys, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @RelationColumn({ name: "user_id" })
  user!: User;
}
