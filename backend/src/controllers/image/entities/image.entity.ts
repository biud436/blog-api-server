import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 특수한 용도의 Entity이므로, entities 폴더 밖에 선언하였습니다.
 * (추후 AWS S3로 교체)
 */
@Entity()
export class Image {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    file: string;

    @Column({
        nullable: false,
    })
    originalname: string;

    @Column({
        nullable: false,
    })
    encoding: string;

    @Column({
        nullable: false,
    })
    mimetype: string;

    @Column({
        nullable: false,
    })
    destination: string;

    @Column({
        length: 256,
        nullable: false,
    })
    filename: string;

    @Column({
        length: 256,
        nullable: false,
    })
    path: string;

    @Column({
        nullable: false,
    })
    size: number;
}
