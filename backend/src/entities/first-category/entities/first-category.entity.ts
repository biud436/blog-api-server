import { SecondCategory } from 'src/entities/second-category/entities/second-category.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 대분류
 */
@Entity()
export class FirstCategory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: false,
    })
    name: string;

    @Column({
        nullable: false,
    })
    description: string;

    @OneToMany(
        () => SecondCategory,
        (secondCategory) => secondCategory.firstCategory,
    )
    secondCategories: SecondCategory[];
}
