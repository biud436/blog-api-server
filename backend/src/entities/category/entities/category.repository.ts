import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Post } from 'src/entities/post/entities/post.entity';
import { CustomRepository } from 'src/common/modules/typeorm-ex/typeorm-ex.decorator';
import { Between, QueryRunner, Repository } from 'typeorm';
import { CategoryDepthVO } from '../dto/category-depth.vo';
import { Category } from './category.entity';

@CustomRepository(Category)
export class CategoryRepository extends Repository<Category> {
    async addCategory(categoryName: string, rootNodeName?: string) {
        const root = await this.findOne({
            where: {
                left: 1,
            },
        });

        // 루트가 없으면 새로운 노드로 저장합니다.
        const isNotFoundRootNode = !root;
        if (isNotFoundRootNode && !rootNodeName) {
            const rootNode = await this.create({
                name: categoryName,
                left: 1,
                right: 2,
            });

            return await this.save(rootNode);
        }

        // 루트 노드와의 거리를 계산합니다.
        const calculateNodeDistance = this.createQueryBuilder('A');
        const updateRgtNo = this.createQueryBuilder('A');
        const updateLftNo = this.createQueryBuilder('A');

        const nodeDistance = await calculateNodeDistance
            .select('A.left', 'left')
            .addSelect('A.left + (A.right - (A.left + 1) )', 'dist')
            .where('A.name = :name', { name: rootNodeName })
            .getRawOne();

        const { dist } = nodeDistance;

        // 오른쪽을 +2
        await updateRgtNo
            .update(Category)
            .set({ right: () => `RGT_NO + 2` })
            .where('RGT_NO > :right', { right: dist })
            .execute();

        // 왼쪽을 +2
        await updateLftNo
            .update(Category)
            .set({ left: () => `LFT_NO + 2` })
            .where('LFT_NO > :left', { left: dist })
            .execute();

        // 새로운 위치에 노드를 삽입합니다.
        const newNode = await this.createQueryBuilder('A')
            .insert()
            .into(Category)
            .values({
                name: categoryName,
                left: dist + 1,
                right: dist + 2,
            })
            .execute();

        return newNode;
    }

    async getCategoryList(): Promise<Category[]> {
        const items = this.createQueryBuilder('category')
            .select()
            .orderBy('category.left', 'ASC')
            .getMany();

        return items;
    }

    /**
     * 카테고리를 깊이 값을 포함하여 계층형으로 출력합니다.
     *
     * @returns
     */
    async selectTreeNodeList(): Promise<CategoryDepthVO[]> {
        const qb = this.createQueryBuilder('node');

        qb.addSelect('node.id', 'id');
        qb.addSelect('node.left', 'left')
            .addSelect('node.right', 'right')
            .addSelect('node.name', 'name')
            .addSelect('(COUNT(node.name) - 1)', 'depth');

        qb.addFrom(Category, 'parent');

        qb.where('node.left BETWEEN parent.left AND parent.right')
            .groupBy('node.left')
            .orderBy('node.left');

        return await qb.getRawMany();
    }

    /**
     * 마지막 깊이의 카테고리를 조회합니다.
     */
    async selectLeafNodes(): Promise<Category[]> {
        const categories = await this.createQueryBuilder('node')
            .select()
            .where('node.right = node.left + 1')
            .getRawMany();

        return categories;
    }

    /**
     * 특정 카테고리의 부모 카테고리를 찾습니다.
     *
     * @param categoryName
     * @returns
     */
    async selectParentNode(categoryName: string) {
        const category: Pick<CategoryDepthVO, 'left'> | undefined =
            await this.createQueryBuilder('category')
                .select('category.left', 'left')
                .where('category.name = :name', { name: categoryName })
                .getRawOne();

        if (!category) {
            throw new InternalServerErrorException(
                '카테고리를 찾을 수 없습니다.',
            );
        }

        const { left } = category;

        const qb = this.createQueryBuilder('category');
        const rootNodes = await qb
            .select()
            .where('A.left < :left', { left: left })
            .andWhere('A.right > :left', { left: left })
            .getMany();

        const parentNode = rootNodes.pop();

        return parentNode;
    }

    async getBreadcrumbs(categoryName: string) {
        const categories = await this.createQueryBuilder('node')
            .addFrom(Category, 'parent')
            .select('parent.name', 'name')
            .where('node.left BETWEEN parent.left AND parent.right')
            .andWhere('node.name = :name', { name: categoryName })
            .orderBy('parent.left')
            .getRawMany();

        const breadcrumbs = categories.map(({ name }) => name);

        return breadcrumbs.join(' > ');
    }

    async selectDescendants(categorId: number) {
        const targetNode = await this.createQueryBuilder('node')
            .select()
            .where('node.id = :id', { id: categorId })
            .getOneOrFail();

        const nodes = await this.createQueryBuilder('node')
            .select()
            .where('node.left BETWEEN :left AND :right', {
                left: targetNode.left,
                right: targetNode.right,
            })
            .getMany();

        return nodes;
    }

    /**
     * 카테고리 명을 변경합니다.
     *
     * @param categoryId
     * @param newCategoryName
     * @returns
     */
    async changeCategoryName(categoryId: number, newCategoryName: string) {
        const qb = this.createQueryBuilder('category')
            .update(Category)
            .set({ name: newCategoryName })
            .where('category.CTGR_SQ = :id', { id: categoryId });

        const updateResult = await qb.execute();

        return updateResult;
    }

    async getPostCountByCategories() {
        const qb = this.createQueryBuilder('node');

        qb.select('node.id', 'id')
            .addSelect('node.name', 'name')
            .addSelect('floor((node.right - (node.left + 1)) / 2)', 'children')
            .addSelect('count(node.name) - 1', 'depth')
            .addSelect((qb) => {
                const resultQueryBuilder = qb
                    .subQuery()
                    .select('COUNT(*)')
                    .from(Post, 'post')
                    .where(
                        `post.categoryId IN (${qb
                            .subQuery()
                            .select('A.id', 'id')
                            .from(Category, 'A')
                            .where('A.left BETWEEN node.left AND node.right')
                            .getQuery()})`,
                    );

                return resultQueryBuilder;
            }, 'postCount')
            .addFrom(Category, 'parent')
            .where('node.left BETWEEN parent.left AND parent.right')
            .groupBy('node.left')
            .orderBy('node.left', 'ASC');

        const result = await qb.getRawMany();

        return result;
    }

    async deleteNode(categoryId: number) {
        const positionNode:
            | (Pick<Category, 'left' | 'right' | 'groupId'> & {
                  width: number;
              })
            | undefined = await this.createQueryBuilder('node')
            .select('node.left', 'left')
            .addSelect('node.right', 'right')
            .addSelect('node.right - node.left + 1', 'width')
            .addSelect('node.groupId', 'groupId')
            .where('node.id = :id', { id: categoryId })
            .getRawOne();

        if (!positionNode) {
            throw new InternalServerErrorException(
                '삭제할 노드를 찾을 수 없습니다',
            );
        }

        await this.delete({
            left: Between(positionNode.left, positionNode.right),
            groupId: positionNode.groupId,
        });

        const tableAlias = this.metadata.tableName;

        let affected = 0;

        // 나머지 노드를 당겨옵니다.
        let updateResult = await this.createQueryBuilder('node')
            .update(Category)
            .set({
                right: () => `${tableAlias}.RGT_NO - ${positionNode.width}`,
            })
            .where(`${tableAlias}.RGT_NO > :right`, {
                right: positionNode.right,
            })
            .andWhere(`${tableAlias}.CTGR_GRP_SQ = :groupId`, {
                groupId: positionNode.groupId,
            })
            .execute();

        if (!updateResult) {
            throw new InternalServerErrorException('노드를 삭제할 수 없습니다');
        }

        affected += updateResult.affected || 0;

        updateResult = await this.createQueryBuilder('node')
            .update(Category)
            .set({
                left: () => `${tableAlias}.LFT_NO - ${positionNode.width}`,
            })
            .where(`${tableAlias}.LFT_NO > :right`, {
                right: positionNode.right,
            })
            .andWhere(`${tableAlias}.CTGR_GRP_SQ = :groupId`, {
                groupId: positionNode.groupId,
            })
            .execute();

        if (!updateResult) {
            throw new InternalServerErrorException('노드를 삭제할 수 없습니다');
        }

        affected += updateResult.affected || 0;

        return {
            ...updateResult,
            affected,
        };
    }
}
