import * as typeorm from 'typeorm';

@typeorm.Entity()
export class Profile {
    @typeorm.PrimaryGeneratedColumn()
    id: number;

    @typeorm.Column({
        unique: true,
        length: 100,
        nullable: false,
    })
    email: string;

    @typeorm.CreateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    createdAt: Date;

    @typeorm.UpdateDateColumn({
        default: () => 'CURRENT_TIMESTAMP',
        nullable: false,
    })
    updatedAt: Date;
}
