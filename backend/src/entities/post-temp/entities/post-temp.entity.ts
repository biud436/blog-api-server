import { Post } from 'src/entities/post/entities/post.entity';
import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Relation,
} from 'typeorm';

/**
 * 임시 저장된 포스트
 * 포스트 임시 저장 기능을 구현합니다.
 */
@Entity()
export class PostTemp {
    /**
     * AUTO_INCREMENT를 이용한 ID 값으로, 블로그에서 임시 저장된 포스트를 조회할 때 사용합니다.
     * DB에서 포스트를 조회할 때, PK 값을 이용하는 것이 상당히 효율적이지만 이 값을 노출시키는 것은 보안상의 문제가 있습니다.
     */
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        length: 255,
    })
    title!: string;

    @Column({
        type: 'text',
    })
    content!: string;

    @Column({
        nullable: true,
    })
    postId?: number | null;

    @Column({
        length: 255,
        nullable: true,
    })
    @Index()
    checksum!: string;

    @Column({ nullable: false })
    userId!: number;

    /**
     * 포스트와 연관 관계를 형성한다
     */
    @ManyToOne(() => Post, (post) => post.postTemps, {
        onDelete: 'RESTRICT',
        onUpdate: 'RESTRICT',
    })
    @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
    post!: Relation<Post>;

    @ManyToOne(() => User, (user) => user.postTemps, {
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
