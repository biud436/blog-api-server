import { EntityRepository, Repository } from 'typeorm';
import { SecondCategory } from './second-category.entity';

@EntityRepository(SecondCategory)
export class SecondCategoryRepository extends Repository<SecondCategory> {}
