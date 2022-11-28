import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { CategoryDepthVO } from 'src/entities/category/dto/category-depth.vo';
import { QueryRunner } from 'typeorm';
import { ChangeCategoryDto } from './dto/change-category.dto';

@Injectable()
export class AdminService {
    constructor(private readonly categoryService: CategoryService) {}

    /**
     * 새로운 카테고리 추가
     *
     * @param queryRunner
     * @param categoryName
     * @param rootNodeName
     * @returns
     */
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

    /**
     * 부모 카테고리 출력
     *
     * @param categoryName
     * @returns
     */
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

    /**
     * 카테고리를 계층적 구조로 출력합니다.
     *
     * @param isBeautify
     * @returns
     */
    async getTreeChildren(isBeautify = true) {
        return await this.categoryService.getTreeChildren(isBeautify);
    }

    /**
     * 카테고리 명을 변경합니다.
     *
     * @param categoryId
     * @param newCategoryName
     * @returns
     */
    async changeCategoryName(categoryId: number, dto: ChangeCategoryDto) {
        return this.categoryService.changeCategoryName(categoryId, dto);
    }
}
