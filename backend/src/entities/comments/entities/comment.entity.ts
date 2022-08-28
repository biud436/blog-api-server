import { Exclude } from 'class-transformer';
import {
    BeforeInsert,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Tree,
    TreeChildren,
    TreeParent,
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
