import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryGroupDto } from './dto/create-category-group.dto';
import { UpdateCategoryGroupDto } from './dto/update-category-group.dto';
import { CategoryGroup } from './entities/category-group.entity';

@Injectable()
export class CategoryGroupService {
    constructor(
        @InjectRepository(CategoryGroup)
        private categoryGroupRepository: Repository<CategoryGroup>,
    ) {}
}
