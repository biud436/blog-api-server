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
import { Image } from 'src/controllers/image/entities/image.entity';
import removeMarkdown from 'markdown-to-text';
import { VirtualColumn } from 'src/decorators/virtual-column.decorator';
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
    // @Exclude()
    categoryId: number;

    // @Column({
    //     nullable: false,
    // })
    // firstCategoryId: number;

    // @Column({
    //     nullable: false,
    // })
    // secondCategoryId: number;

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

    // @VirtualColumn('previewContent')
    // @Transform((value: TransformFnParams) => {
    //     removeMarkdown(value.value)?.slice(0, 100);
    // })
    previewContent?: string;

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
     * 댓글 참조
     */
    @OneToMany(() => PostComment, (comment) => comment.post)
    comments: PostComment[];

    /**
     * 이미지
     */
    @OneToMany(() => Image, (image) => image.post)
    images: Image[];

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
