import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateFirstCategoryDto } from './dto/create-first-category.dto';
import { UpdateFirstCategoryDto } from './dto/update-first-category.dto';
import { FirstCategory } from './entities/first-category.entity';
import { FirstCategoryRepository } from './entities/first-category.repository';

@Injectable()
export class FirstCategoryService {
    constructor(
        @InjectRepository(FirstCategory)
        private readonly firstCategoryRepository: FirstCategoryRepository,
    ) {}
}
