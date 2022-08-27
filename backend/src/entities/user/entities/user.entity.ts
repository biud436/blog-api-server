/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '../../profile/entities/profile.entity';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import {
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';
import { Post } from 'src/entities/post/entities/post.entity';
import { Admin } from 'src/entities/admin/entities/admin.entity';
import { ApiKey } from 'src/entities/api-key/entities/api-key.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
        unique: true,
    })
    username: string;

    @Column({
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

    @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
    apiKeys: ApiKey[];

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
