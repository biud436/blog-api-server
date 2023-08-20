import { Post } from 'src/entities/post/entities/post.entity';
import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';

/**
 * @class PostComment
 * @description 포스트 댓글
 * lib.dom.d.ts의 Comment와 이름이 겹치므로 PostComment로 명명
 */
@Entity()
export class PostComment {
    @PrimaryGeneratedColumn()
    id!: number;

    /**
     * 포스트 ID
     */
    @Column({
        name: 'post_id',
    })
    postId!: number;

    /**
     * 작성자 ID
     */
    @Column({
        name: 'user_id',
        nullable: false,
    })
    userId!: number;

    /**
     * @example "안녕하세요"
     */
    @Column({
        nullable: false,
    })
    content!: string;

    @ManyToOne(() => Post, (post) => post.comments)
    @JoinColumn({ name: 'post_id' })
    post!: Post;

    @ManyToOne(() => User, (user) => user.comments)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        name: 'parent_id',
        nullable: true,
    })
    parentId?: number;

    @Column({
        name: 'pos',
        default: 0,
    })
    pos!: number;

    @Column({
        name: 'depth',
        default: 0,
    })
    depth!: number;

    parent?: PostComment | null;

    /**
     * 작성일
     */
    @CreateDateColumn()
    createdAt!: Date;

    /**
     * 수정일
     */
    @UpdateDateColumn()
    updatedAt!: Date;

    /**
     * 삭제일 (DeleteDateColumn은 사용하지 않음)
     */
    @Column({
        nullable: true,
        default: null,
    })
    deletedAt?: Date;
}
