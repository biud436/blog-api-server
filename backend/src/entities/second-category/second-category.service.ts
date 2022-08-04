import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecondCategory } from './entities/second-category.entity';

@Injectable()
export class SecondCategoryService {
    constructor(
        @InjectRepository(SecondCategory)
        private readonly secondCategoryRepository: Repository<SecondCategory>,
    ) {}
}
