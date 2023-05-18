import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class UserCopy {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        nullable: false,
    })
    username!: string;

    @CreateDateColumn()
    createdAt!: Date;
}
