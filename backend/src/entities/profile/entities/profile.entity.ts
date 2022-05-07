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
    id: number;

    /**
     * 이메일
     */
    @Column({
        unique: true,
        length: 100,
        nullable: false,
    })
    email: string;

    /**
     * 생성일
     */
    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    createdAt: Date;

    /**
     * 수정일
     */
    @UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    updatedAt: Date;

    /**
     * 닉네임
     */
    @Column({
        nullable: false,
    })
    nickname: string;
}
