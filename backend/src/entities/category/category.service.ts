import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { QueryRunner, Repository, UpdateResult } from 'typeorm';
import { CategoryDepthVO } from './dto/category-depth.vo';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
    constructor(
        @InjectRepository(Category)
        private readonly categoryRepository: Repository<Category>,
    ) {}

    /**
     * 새로운 카테고리를 추가합니다.
     *
     * @param queryRunner 트랜잭션을 위해 Query Runner를 전달해주세요.
     * @param categoryName 카테고리 명
     * @param rootNodeName 루트 카테고리 명 (생략 가능)
     * @returns
     */
    async addCategory(
        queryRunner: QueryRunner,
        categoryName: string,
        rootNodeName?: string,
    ) {
        const root = await this.categoryRepository.findOne({
            where: {
                left: 1,
            },
        });

        // 루트가 없으면 새로운 노드로 저장합니다.
        const isNotFoundRootNode = !root;
        if (isNotFoundRootNode && !rootNodeName) {
            const rootNode = await this.categoryRepository.create({
                name: categoryName,
                left: 1,
                right: 2,
            });

            return await queryRunner.manager.save(rootNode);
        }

        // 루트 노드와의 거리를 계산합니다.
        const calculateNodeDistance =
            this.categoryRepository.createQueryBuilder('A');
        const updateRgtNo = this.categoryRepository.createQueryBuilder('A');
        const updateLftNo = this.categoryRepository.createQueryBuilder('A');

        const nodeDistance = await calculateNodeDistance
            .select('A.left', 'left')
            .addSelect('A.left + (A.right - (A.left + 1) )', 'dist')
            .where('A.name = :name', { name: rootNodeName })
            .setQueryRunner(queryRunner)
            .useTransaction(true)
            .getRawOne();

        const { dist } = nodeDistance;

        // 오른쪽을 +2
        await updateRgtNo
            .update(Category)
            .set({ right: () => `RGT_NO + 2` })
            .where('RGT_NO > :right', { right: dist })
            .useTransaction(true)
            .setQueryRunner(queryRunner)
            .execute();

        // 왼쪽을 +2
        await updateLftNo
            .update(Category)
            .set({ left: () => `LFT_NO + 2` })
            .where('LFT_NO > :left', { left: dist })
            .useTransaction(true)
            .setQueryRunner(queryRunner)
            .execute();

        // 새로운 위치에 노드를 삽입합니다.
        const newNode = await this.categoryRepository
            .createQueryBuilder('A')
            .insert()
            .into(Category)
            .values({
                name: categoryName,
                left: dist + 1,
                right: dist + 2,
            })
            .useTransaction(true)
            .setQueryRunner(queryRunner)
            .execute();

        return newNode;
    }

    /**
     * 카테고리를 깊이 값을 포함하여 계층형으로 출력합니다.
     *
     * @returns
     */
    async selectTreeNodeList(): Promise<CategoryDepthVO[]> {
        const qb = this.categoryRepository.createQueryBuilder('node');

        qb.select('node.left', 'left')
            .addSelect(
                "CONCAT( REPEAT(' ', COUNT(node.name) - 1), node.name )",
                'name',
            )
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
        const categories = await this.categoryRepository
            .createQueryBuilder('node')
            .select()
            .where('node.right = node.left + 1')
            .getMany();

        return categories;
    }

    /**
     * 특정 카테고리의 부모 카테고리를 찾습니다.
     *
     * @param categoryName
     * @returns
     */
    async selectParentNode(categoryName: string) {
        const category: Pick<CategoryDepthVO, 'left'> =
            await this.categoryRepository
                .createQueryBuilder('category')
                .select('category.left', 'left')
                .where('category.name = :name', { name: categoryName })
                .getRawOne();

        const { left } = category;

        const qb = this.categoryRepository.createQueryBuilder('category');
        const rootNodes = await qb
            .select()
            .where('A.left < :left', { left: left })
            .andWhere('A.right > :left', { left: left })
            .getMany();

        const parentNode = rootNodes.pop();

        return parentNode;
    }

    /**
     * 리스트를 계층형으로 출력합니다.
     *
     * @returns
     */
    async getDepthList() {
        const nodes = (await this.selectTreeNodeList()).map((e) =>
            plainToClass(CategoryDepthVO, e),
        );

        console.log(nodes);

        if (!nodes || nodes.length <= 0) {
            throw new InternalServerErrorException('리스트가 비어있습니다');
        }

        let [currentDepth, previousDepth, difference] = [0, 0, 0];
        let [rootNode, lastRootNode, prevNode, curNode] = [
            nodes[0],
            nodes[0],
            nodes[0],
            nodes[0],
        ];

        console.group(rootNode, lastRootNode, prevNode, curNode);

        const resultTree: CategoryDepthVO[] = [];
        let isDirty = false;
        let maybeDepth = 0;

        for (const node of nodes) {
            curNode = node;
            currentDepth = node.depth;

            difference = currentDepth - previousDepth;
            isDirty = false;
            lastRootNode = rootNode;

            if (difference > 0) {
                rootNode = prevNode;
            } else if (difference < 0) {
                maybeDepth = lastRootNode.depth - 1;

                for (const secondRoofNode of resultTree) {
                    if (secondRoofNode.depth === maybeDepth) {
                        rootNode = secondRoofNode;
                        break;
                    }
                }
            }

            if (rootNode !== curNode) {
                isDirty = true;
                rootNode?.addChild(curNode);
            }

            if (!isDirty) {
                resultTree.push(node);
            }

            previousDepth = currentDepth;
            prevNode = curNode;
        }

        return resultTree;
    }
}
