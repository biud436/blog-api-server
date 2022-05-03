import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateSecondCategoryDto } from './dto/create-second-category.dto';
import { UpdateSecondCategoryDto } from './dto/update-second-category.dto';
import { SecondCategory } from './entities/second-category.entity';
import { SecondCategoryRepository } from './entities/second-category.repository';

@Injectable()
export class SecondCategoryService {
    constructor(
        @InjectRepository(SecondCategory)
        private readonly firstCategoryRepository: SecondCategoryRepository,
    ) {}
}
