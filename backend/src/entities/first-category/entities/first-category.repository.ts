import { EntityRepository, Repository } from 'typeorm';
import { FirstCategory } from './first-category.entity';

@EntityRepository(FirstCategory)
export class FirstCategoryRepository extends Repository<FirstCategory> {}
