import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { CategoryDepthVO } from 'src/entities/category/dto/category-depth.vo';
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

    async getAncestors(categoryName: string) {
        const nodeList = await this.categoryService.getCategoryList();
        const targetNode = nodeList.find((node) => node.name === categoryName);

        if (!targetNode) {
            throw new InternalServerErrorException(
                `Can't find the category named ${categoryName}`,
            );
        }

        return this.categoryService.getAncestors(nodeList, targetNode);
    }
}
