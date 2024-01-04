import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { IResponsableData } from 'src/common/libs/response/interface/response.interface';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { DeleteQueryBuilder, QueryRunner } from 'typeorm';
import { ChangeCategoryDto } from './dto/change-category.dto';
import {
    Transactional,
    TransactionalZone,
} from 'src/common/decorators/transactional';

@Injectable()
@TransactionalZone()
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
    @Transactional()
    async addCategory(categoryName: string, rootNodeName?: string) {
        return await this.categoryService.addCategory(
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
    @Transactional()
    async moveCategory(
        moveCategoryDto: MoveCategoryDto,
    ): Promise<IResponsableData | ResponseUtil.FailureResponse | any> {
        try {
            const res = await this.categoryService.moveCategory(
                moveCategoryDto,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
        } catch (e: any) {
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
        try {
            const nodeList = await this.categoryService.getCategoryList();
            const targetNode = nodeList.find(
                (node) => node.name === categoryName,
            );

            if (!targetNode) {
                throw new InternalServerErrorException(
                    `Can't find the category named ${categoryName}`,
                );
            }

            const res = await this.categoryService.getAncestors(
                nodeList,
                targetNode,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            throw new BadRequestException({
                name: 'GetAncestorsError',
                message: '상위 카테고리를 조회하는데 실패했습니다.',
            });
        }
    }

    /**
     * Obtains the hierarchical structure.
     *
     * @param isBeautify
     * @returns
     */
    async getTreeChildren(isBeautify = true) {
        try {
            const res = await this.categoryService.getTreeChildren(isBeautify);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            throw new BadRequestException({
                name: 'GetTreeChildrenError',
                message: '트리 구조를 조회하는데 실패했습니다.',
            });
        }
    }

    /**
     * Rename the category name.
     *
     * @param categoryId
     * @param newCategoryName
     * @returns
     */
    async changeCategoryName(categoryId: number, dto: ChangeCategoryDto) {
        try {
            const res = await this.categoryService.changeCategoryName(
                categoryId,
                dto,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
        } catch (e: any) {
            throw new BadRequestException({
                name: 'ChangeCategoryNameError',
                message: '카테고리 이름 변경에 실패했습니다.',
            });
        }
    }
}
