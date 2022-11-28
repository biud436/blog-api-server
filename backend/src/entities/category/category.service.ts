import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { ChangeCategoryDto } from 'src/controllers/admin/dto/change-category.dto';
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

    async getCategoryList(): Promise<Category[]> {
        const items = this.categoryRepository
            .createQueryBuilder('category')
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
        const qb = this.categoryRepository.createQueryBuilder('node');

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
        const categories = await this.categoryRepository
            .createQueryBuilder('node')
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
     * 특정 카테고리까지의 경로를 조회합니다.
     */
    async getBreadcrumbs(categoryName: string) {
        const categories = await this.categoryRepository
            .createQueryBuilder('node')
            .addFrom(Category, 'parent')
            .select('parent.name', 'name')
            .where('node.left BETWEEN parent.left AND parent.right')
            .andWhere('node.name = :name', { name: categoryName })
            .orderBy('parent.left')
            .getRawMany();

        const breadcrumbs = categories.map(({ name }) => name);

        return breadcrumbs.join(' > ');
    }

    /**
     * 타겟 노드의 부모, 조상 노드 출력
     * @param nodes
     * @param targetNode
     * @returns
     */
    async getAncestors(nodes: Category[], targetNode: Category) {
        const ancestors: Category[] = [];

        nodes.forEach((node) => {
            if (
                node.left <= targetNode.left &&
                node.right >= targetNode.right
            ) {
                ancestors.push(node);
            }
        });

        return ancestors;
    }

    /**
     * 자손 노드를 모두 출력합니다.
     *
     * @param nodes
     * @param targetNode
     * @returns
     */
    async getDescendants(nodes: Category[], targetNode: Category) {
        const descendants: Category[] = [];

        nodes.forEach((node) => {
            if (
                node.left >= targetNode.left &&
                node.right <= targetNode.right
            ) {
                descendants.push(node);
            }
        });

        return descendants;
    }

    async selectDescendants(categorId: number) {
        const targetNode = await this.categoryRepository
            .createQueryBuilder('node')
            .select()
            .where('node.id = :id', { id: categorId })
            .getOneOrFail();

        const nodes = await this.categoryRepository
            .createQueryBuilder('node')
            .select()
            .where('node.left BETWEEN :left AND :right', {
                left: targetNode.left,
                right: targetNode.right,
            })
            .getMany();

        return nodes;
    }

    /**
     * 타겟 노드의 부모, 조상 노드 출력
     * @param nodes
     * @param targetNode
     * @returns
     */
    async getAncestorsWithDepth(
        nodes: CategoryDepthVO[],
        targetNode: CategoryDepthVO,
    ) {
        const ancestors: CategoryDepthVO[] = [];

        nodes.forEach((node) => {
            if (
                node.left <= targetNode.left &&
                node.right >= targetNode.right
            ) {
                ancestors.push(node);
            }
        });

        return ancestors;
    }

    /**
     * 자식 노드의 갯수를 출력합니다.
     *
     * @param targetNode
     * @returns
     */
    async getNumberOfChildren(targetNode: CategoryDepthVO) {
        const n = (targetNode.right - (targetNode.left + 1)) / 2;

        return n;
    }

    private convrtWithData(data: CategoryDepthVO[]) {
        const result: any[] = [];

        const convertRecursive = (
            data: CategoryDepthVO[],
            parent: CategoryDepthVO,
        ) => {
            data.forEach((item) => {
                const node = [item.name, parent?.name ?? '', item.depth];
                result.push(node);
                if (item.children) {
                    convertRecursive(item.children, item);
                }
            }, this);
        };
        convertRecursive(data, null);

        return result;
    }

    /**
     * 트리 구조를 출력합니다.
     * @returns
     */
    async getTreeChildren(isBeautify: boolean): Promise<CategoryDepthVO[]> {
        const nodeList: CategoryDepthVO[] = await this.selectTreeNodeList();
        if (!nodeList || nodeList.length <= 0) {
            throw new InternalServerErrorException(
                '노드 목록을 찾을 수 없습니다',
            );
        }

        const tree: CategoryDepthVO[] = [];
        const visitied: CategoryDepthVO[] = [];

        const isRootNode = (node: CategoryDepthVO) => node.left === 1;

        for (const node of nodeList) {
            const nodeVO = plainToClass(CategoryDepthVO, node);
            if (isRootNode(nodeVO)) {
                tree.push(nodeVO);
                visitied.push(nodeVO);
            } else {
                const ancestors = await this.getAncestorsWithDepth(
                    visitied,
                    nodeVO,
                );
                if (!ancestors || ancestors.length <= 0) {
                    throw new InternalServerErrorException(
                        '조상 노드를 찾을 수 없습니다',
                    );
                }

                const parent = ancestors[ancestors.length - 1];
                parent.addChild(nodeVO);
                visitied.push(nodeVO);
            }
        }

        return isBeautify ? tree : this.convrtWithData(tree);
    }

    /**
     * 카테고리 명을 변경합니다.
     *
     * @param categoryId
     * @param newCategoryName
     * @returns
     */
    async changeCategoryName(
        categoryId: number,
        { categoryName: newCategoryName }: ChangeCategoryDto,
    ) {
        const qb = this.categoryRepository
            .createQueryBuilder('category')
            .update(Category)
            .set({ name: newCategoryName })
            .where('category.CTGR_SQ = :id', { id: categoryId });

        const updateResult = await qb.execute();

        return updateResult;
    }
}
