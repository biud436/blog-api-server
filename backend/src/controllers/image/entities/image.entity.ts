import { Exclude } from 'class-transformer';
import { Post } from 'src/entities/post/entities/post.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * 특수한 용도의 Entity이므로, entities 폴더 밖에 선언하였습니다.
 * (추후 AWS S3로 교체)
 */
@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        nullable: false,
    })
    originalname!: string;

    @Column({
        nullable: false,
    })
    @Exclude()
    encoding!: string;

    @Column({
        nullable: false,
    })
    mimetype!: string;

    @Column({
        nullable: false,
    })
    @Exclude()
    destination!: string;

    @Column({
        length: 256,
        nullable: false,
    })
    @Exclude()
    filename!: string;

    @Column({
        length: 256,
        nullable: false,
    })
    path!: string;

    @Column({
        nullable: false,
    })
    size!: number;

    @Column({
        nullable: true,
        name: 'post_id',
    })
    postId!: number;

    @ManyToOne(() => Post, (post) => post.images, {
        createForeignKeyConstraints: false,
        nullable: true,
    })
    @JoinColumn({ name: 'post_id', referencedColumnName: 'id' })
    post!: Post;
}
