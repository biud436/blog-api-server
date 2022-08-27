import { Injectable } from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { QueryRunner } from 'typeorm';

@Injectable()
export class AdminService {
    constructor(private readonly categoryService: CategoryService) {}

    async addCategory(
        queryRunner: QueryRunner,
        categoryName: string,
        rootNodeName?: string,
    ) {
        return this.categoryService.addCategory(
            queryRunner,
            categoryName,
            rootNodeName,
        );
    }

    async getDepthList() {
        return this.categoryService.getDepthList();
    }
}
