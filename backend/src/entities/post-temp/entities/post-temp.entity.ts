import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

/**
 * 임시 저장된 포스트
 * 포스트 임시 저장 기능을 구현합니다.
 */
@Entity()
export class PostTemp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 255,
    })
    title: string;

    @Column({
        type: 'text',
    })
    content: string;

    @Column({ nullable: false })
    userId: number;

    @ManyToOne(() => User, (user) => user.postTemps, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
    user: User;

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    createdAt: Date;

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    updatedAt: Date;
}
