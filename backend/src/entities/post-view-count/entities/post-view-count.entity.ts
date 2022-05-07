import {
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PostViewCount {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({
        nullable: false,
    })
    createdAt: Date;

    @UpdateDateColumn({
        nullable: false,
    })
    updatedAt: Date;
}
