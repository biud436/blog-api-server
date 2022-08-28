import { Exclude } from 'class-transformer';
import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
    UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Post } from 'src/entities/post/entities/post.entity';

@Entity()
@Tree('materialized-path')
export class PostComment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    content: string;

    @TreeChildren()
    children: PostComment[];

    @TreeParent()
    parent: PostComment;

    @Column({
        name: 'post_id',
    })
    postId: number;

    @ManyToOne(() => Post, (post) => post.comments, {
        createForeignKeyConstraints: false,
    })
    @JoinColumn({ name: 'post_id' })
    post: Post;

    @CreateDateColumn({
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

    async hashPassword(password: string) {
        this.password = await bcrypt.hash(password, 10);
    }

    @BeforeInsert()
    async savePassword() {
        await this.hashPassword(this.password);
    }

    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }
}
