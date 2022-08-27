import { Exclude } from 'class-transformer';
import { Post } from 'src/entities/post/entities/post.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

    @OneToMany(() => Post, (post) => post.category)
    posts: Post[];
}
