import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryGroup } from './entities/category-group.entity';

@Injectable()
export class CategoryGroupService {
    constructor(
        @InjectRepository(CategoryGroup)
        private categoryGroupRepository: Repository<CategoryGroup>,
    ) {}
}
