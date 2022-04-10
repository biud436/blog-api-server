import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 특수한 용도의 Entity이므로, entities 폴더 밖에 선언하였습니다.
 */
@Entity()
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  file: string;

  @Column()
  originalname: string;

  @Column()
  encoding: string;

  @Column()
  mimetype: string;

  @Column()
  destination: string;

  @Column({
    length: 256,
  })
  filename: string;

  @Column({
    length: 256,
  })
  path: string;

  @Column()
  size: number;
}
