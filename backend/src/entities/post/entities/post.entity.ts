import { Exclude, Transform, TransformFnParams } from 'class-transformer';
import { Category } from 'src/entities/category/entities/category.entity';
import { PostViewCount } from 'src/entities/post-view-count/entities/post-view-count.entity';
import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { PostComment } from 'src/entities/comments/entities/comment.entity';
import { decodeHtml } from 'src/common/html-escpse';

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
    @Exclude()
    authorId: number;

    @Column({
        nullable: false,
        name: 'category_id',
    })
    @Exclude()
    categoryId: number;

    // @Column({
    //     nullable: false,
    // })
    // firstCategoryId: number;

    // @Column({
    //     nullable: false,
    // })
    // secondCategoryId: number;

    @Column({
        nullable: false,
    })
    @Exclude()
    viewCountId?: number;

    /**
     * 제목
     */
    @Column({
        nullable: false,
    })
    @Transform((value: TransformFnParams) => decodeHtml(value.value))
    title: string;

    /**
     * 상세 내용
     */
    @Column({
        nullable: false,
        type: 'text',
    })
    @Transform((value: TransformFnParams) => decodeHtml(value.value))
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
    @Exclude()
    updatedAt: Date;

    @DeleteDateColumn({
        nullable: true,
    })
    @Exclude()
    deletedAt?: Date;

    @ManyToOne(() => User, (user) => user.posts, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'author_id',
        referencedColumnName: 'id',
    })
    user: User;

    @ManyToOne(() => Category, (firstCategory) => firstCategory.posts, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'category_id',
        referencedColumnName: 'id',
    })
    category: Category;

    /**
     * 조회수
     */
    @OneToOne(() => PostViewCount, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'view_count_id',
    })
    viewCount?: PostViewCount;

    /**
     * 댓글 참조
     */
    @OneToMany(() => PostComment, (comment) => comment.post)
    comments: PostComment[];

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
