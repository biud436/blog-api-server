import { FirstCategory } from 'src/entities/first-category/entities/first-category.entity';
import { Post } from 'src/entities/post/entities/post.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * 중분류
 */
@Entity()
export class SecondCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    name: string;

    @Column({
        nullable: false,
    })
    description: string;

    @ManyToOne(
        () => FirstCategory,
        (firstCategory) => firstCategory.secondCategories,
        {
            onDelete: 'RESTRICT',
            onUpdate: 'RESTRICT',
        },
    )
    firstCategory: FirstCategory;

    @OneToMany(() => Post, (post) => post.secondCategory)
    posts: Post[];
}
