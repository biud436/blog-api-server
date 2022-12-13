import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CategoryService } from 'src/entities/category/category.service';
import { CategoryDepthVO } from 'src/entities/category/dto/category-depth.vo';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { CreatePostTempDto } from 'src/entities/post-temp/dto/create-post-temp.dto';
import { UpdatePostTempDto } from 'src/entities/post-temp/dto/update-post-temp.dto';
import { PostTempService } from 'src/entities/post-temp/post-temp.service';
import { RESPONSE_MESSAGE } from 'src/libs/response/response';
import { IResponsableData } from 'src/libs/response/interface/response.interface';
import { ResponseUtil } from 'src/libs/response/ResponseUtil';
import { DeleteQueryBuilder, QueryRunner } from 'typeorm';
import { ChangeCategoryDto } from './dto/change-category.dto';

@Injectable()
export class AdminService {
    constructor(
        private readonly categoryService: CategoryService,
        private readonly postTempService: PostTempService,
    ) {}

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

    /**
     * Obtain a specific temporary post by ID.
     *
     * @param userId
     * @param postId
     * @returns
     */
    async getTempPostById(userId: number, postId: number) {
        return this.postTempService.findOne(userId, postId);
    }

    /**
     * Obtain a list of temporary posts.
     *
     * @param userId
     * @returns
     */
    async getTempPost(userId: number) {
        return this.postTempService.findAll(userId);
    }

    /**
     * Create a new temporary post.
     *
     * @param userId
     * @param data
     * @returns
     */
    async saveTempPost(userId: number, data: CreatePostTempDto) {
        return this.postTempService.create(userId, data);
    }

    /**
     * Update the temporary post.
     *
     * @param userId
     * @param postId
     * @param data
     * @returns
     */
    async updateTempPost(
        userId: number,
        postId: number,
        data: UpdatePostTempDto,
    ) {
        return this.postTempService.updateById(data, userId, postId);
    }

    /**
     * Delete the temporary post by ID.
     * @param userId
     * @param postId
     * @returns
     */
    async deleteTempPostById(userId: number, postId: number) {
        return this.postTempService.deleteById(userId, postId);
    }
}
