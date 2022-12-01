import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { CategoryDepthVO } from 'src/entities/category/dto/category-depth.vo';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { IResponsableData } from 'src/utils/response.interface';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { QueryRunner } from 'typeorm';
import { ChangeCategoryDto } from './dto/change-category.dto';

@Injectable()
export class AdminService {
    constructor(private readonly categoryService: CategoryService) {}

    /**
     * Adds a new category to category table.
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
     * Moves the category to another category.
     *
     * @param moveCategoryDto
     * @returns
     */
    async moveCategory(
        moveCategoryDto: MoveCategoryDto,
    ): Promise<IResponsableData | ResponseUtil.FailureResponse | any> {
        try {
            const res = await this.categoryService.moveCategory(
                moveCategoryDto,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
        } catch (e) {
            if (e.name === 'CustomError') {
                return e;
            }

            return ResponseUtil.failure(RESPONSE_MESSAGE.UPDATE_FAIL);
        }
    }

    /**
     * Prints out the parent category of the target category.
     * it will be returned the list of parent category.
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
     * Obtains the hierarchical structure.
     *
     * @param isBeautify
     * @returns
     */
    async getTreeChildren(isBeautify = true) {
        return await this.categoryService.getTreeChildren(isBeautify);
    }

    /**
     * Rename the category name.
     *
     * @param categoryId
     * @param newCategoryName
     * @returns
     */
    async changeCategoryName(categoryId: number, dto: ChangeCategoryDto) {
        return this.categoryService.changeCategoryName(categoryId, dto);
    }
}
