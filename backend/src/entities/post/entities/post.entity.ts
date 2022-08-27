import { FirstCategory } from 'src/entities/first-category/entities/first-category.entity';
import { PostViewCount } from 'src/entities/post-view-count/entities/post-view-count.entity';
import { SecondCategory } from 'src/entities/second-category/entities/second-category.entity';
import { User } from 'src/entities/user/entities/user.entity';
import {
    Column,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
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
    firstCategoryId: number;

    @Column({
        nullable: false,
    })
    secondCategoryId: number;

    @Column({
        nullable: false,
    })
    viewCountId?: number;

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
    deletedAt?: Date;

    @ManyToOne(() => User, (user) => user.posts, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'authorId',
        referencedColumnName: 'id',
    })
    user: User;

    /**
     * 대분류
     */
    @ManyToOne(() => FirstCategory, (firstCategory) => firstCategory.posts, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'firstCategoryId',
        referencedColumnName: 'id',
    })
    firstCategory: FirstCategory;

    /**
     * 중분류
     */
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
     * 조회수
     */
    @OneToOne(() => PostViewCount, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'viewCountId',
    })
    viewCount?: PostViewCount;

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
