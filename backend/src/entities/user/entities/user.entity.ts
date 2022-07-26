/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from 'src/entities/profile/entities/profile.entity';
import * as bcrypt from 'bcrypt';
import { Exclude, plainToClass } from 'class-transformer';
import {
    AfterInsert,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    getConnection,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Post } from 'src/entities/post/entities/post.entity';
import { Admin } from 'src/entities/admin/entities/admin.entity';
import { Image } from 'src/controllers/image/entities/image.entity';
import { Inject } from '@nestjs/common';
import { ImageService } from 'src/controllers/image/image.service';
import { UserCopyService } from 'src/entities/user-copy/user-copy.service';
import { UserCopy } from 'src/entities/user-copy/entities/user-copy.entity';
import { CreateUserCopyDto } from 'src/entities/user-copy/dto/create-user-copy.dto';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    username: string;

    @Column({
        name: 'profile_id',
        nullable: false,
    })
    profileId: number;

    @Column({
        default: true,
        nullable: false,
    })
    isValid: boolean;

    @OneToOne(() => Profile, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'profile_id',
    })
    profile: Profile;

    @OneToMany(() => Post, (post) => post.user)
    posts: Post[];

    @OneToMany(() => Admin, (admin) => admin.user)
    admins: Admin[];

    @Column({
        nullable: false,
    })
    @Exclude()
    password: string;

    async hashPassword(password: string) {
        this.password = await bcrypt.hash(password, 10);
    }

    @BeforeInsert()
    async savePassword() {
        await this.hashPassword(this.password);
    }

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    createdAt: Date;

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
