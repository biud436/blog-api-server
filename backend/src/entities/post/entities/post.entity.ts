import { SecondCategory } from 'src/entities/second-category/entities/second-category.entity';
import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number;

    /**
     * 작성자
     */
    @Column({
        nullable: false,
    })
    authorId: number;

    @Column({
        nullable: false,
    })
    secondCategoryId: number;

    /**
     * 제목
     */
    @Column({
        nullable: false,
    })
    title: string;

    /**
     * 상세 내용
     */
    @Column({
        nullable: false,
        type: 'text',
    })
    content: string;

    @Column({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    uploadDate: Date;

    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    updatedAt: Date;

    @DeleteDateColumn({
        nullable: true,
    })
    deletedAt: Date;

    @ManyToOne(() => User, (user) => user.posts, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'author_id',
        referencedColumnName: 'id',
    })
    user: User;

    @ManyToOne(() => SecondCategory, (secondCategory) => secondCategory.posts, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'secondCategoryId',
        referencedColumnName: 'id',
    })
    secondCategory: SecondCategory;

    /**
     * Build Post entity.
     * @returns
     */
    static build(): Omit<Post, 'id' | 'user'> {
        const post = new Post();
        const { id, user, ...otherValues } = post;

        return otherValues;
    }
}
