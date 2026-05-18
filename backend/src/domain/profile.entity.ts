import {
  Column,
  CreateTimestamp,
  Entity,
  PrimaryGeneratedColumn,
  UniqueIndex,
  UpdateTimestamp,
} from "@stingerloom/orm";

@Entity({ name: "profile" })
@UniqueIndex(["email"])
@UniqueIndex(["nickname"])
export class Profile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100 })
  email!: string;

  @CreateTimestamp()
  createdAt!: Date;

  @UpdateTimestamp()
  updatedAt!: Date;

  @Column({ type: "varchar", length: 255 })
  nickname!: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  profileImage!: string;
}
