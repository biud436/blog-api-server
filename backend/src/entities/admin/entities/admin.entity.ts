import { User } from 'src/entities/user/entities/user.entity';

import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Relation,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Admin {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: false })
    userId!: number;

    @ManyToOne(() => User, (user) => user.admins, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user!: Relation<User>;

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    createdAt!: Date;

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    updatedAt!: Date;
}
