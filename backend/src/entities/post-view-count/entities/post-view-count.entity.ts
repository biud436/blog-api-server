import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PostViewCount {
    @PrimaryGeneratedColumn()
    @Exclude()
    id!: number;

    @CreateDateColumn({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    @Exclude()
    createdAt!: Date;

    @UpdateDateColumn({
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
    })
    @Exclude()
    updatedAt!: Date;

    @Column({
        nullable: false,
        default: 0,
    })
    count!: number;
}
