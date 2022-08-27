import { Exclude } from 'class-transformer';
import * as typeorm from 'typeorm';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    @Exclude()
    id: number;

    /**
     * 이메일
     */
    @Column({
        unique: true,
        length: 100,
        nullable: false,
    })
    @Exclude()
    email: string;

    /**
     * 생성일
     */
    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    @Exclude()
    createdAt: Date;

    /**
     * 수정일
     */
    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    @Exclude()
    updatedAt: Date;

    /**
     * 닉네임
     */
    @Column({
        nullable: false,
        unique: true,
    })
    nickname: string;
}
