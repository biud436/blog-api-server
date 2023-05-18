/* eslint-disable @typescript-eslint/no-unused-vars */
import { Profile } from '../../profile/entities/profile.entity';
import * as bcrypt from 'bcrypt';
import { Exclude, Expose } from 'class-transformer';
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
import { BlogMetaData } from 'src/entities/blog-meta-data/entities/blog-meta-data.entity';
import { PostTemp } from 'src/entities/post-temp/entities/post-temp.entity';
import { Role } from 'src/common/decorators/role.enum';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        nullable: false,
        unique: true,
    })
    username!: string;

    @Column({
        nullable: false,
    })
    @Exclude()
    profileId!: number;

    @Column({
        default: true,
        nullable: false,
    })
    @Exclude()
    isValid!: boolean;

    @OneToOne(() => Profile, {
        onUpdate: 'RESTRICT',
        onDelete: 'RESTRICT',
    })
    @JoinColumn({
        name: 'profile_id',
    })
    profile!: Profile;

    @OneToMany(() => Post, (post) => post.user)
    posts!: Post[];

    @OneToMany(() => Admin, (admin) => admin.user)
    admins!: Admin[];

    @OneToMany(() => ApiKey, (apiKey) => apiKey.user)
    apiKeys!: ApiKey[];

    @OneToMany(() => BlogMetaData, (blogMetaData) => blogMetaData.user)
    blogMetaData!: BlogMetaData[];

    @OneToMany(() => PostTemp, (postTemp) => postTemp.user)
    postTemps!: PostTemp[];

    @Column({
        nullable: false,
    })
    @Exclude()
    password!: string;

    @Expose({
        name: 'role',
    })
    get role() {
        const adminRoles = this.admins ?? [];

        if (adminRoles.length > 0) {
            return Role.Admin;
        }

        return Role.User;
    }

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
    @Exclude()
    createdAt!: Date;

    @CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
    })
    @Exclude()
    updatedAt!: Date;
}
