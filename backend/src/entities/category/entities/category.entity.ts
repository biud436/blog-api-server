import { Exclude } from 'class-transformer';
import { CategoryGroup } from 'src/entities/category-group/entities/category-group.entity';
import { Post } from 'src/entities/post/entities/post.entity';
import {
    Column,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
    @PrimaryGeneratedColumn({
        name: 'CTGR_SQ',
    })
    @Exclude()
    id: number;

    @Column({
        name: 'CTGR_NM',
    })
    @Index()
    name: string;

    @Column({
        name: 'LFT_NO',
    })
    @Exclude()
    left: number;

    @Column({
        name: 'RGT_NO',
    })
    @Exclude()
    right: number;

    @Column({
        name: 'CTGR_GRP_SQ',
        default: 1,
    })
    groupId: number;

    @OneToMany(() => Post, (post) => post.category)
    posts: Post[];

    @ManyToOne(() => CategoryGroup, (categoryGroup) => categoryGroup.categories)
    @JoinColumn({
        name: 'CTGR_GRP_SQ',
    })
    categoryGroup: CategoryGroup;
}
