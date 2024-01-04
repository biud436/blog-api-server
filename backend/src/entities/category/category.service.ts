/* eslint-disable prefer-const */
import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { ChangeCategoryDto } from 'src/controllers/admin/dto/change-category.dto';
import {
    Between,
    DataSource,
    InsertResult,
    QueryRunner,
    Repository,
    SelectQueryBuilder,
    UpdateResult,
} from 'typeorm';
import { Post } from '../post/entities/post.entity';
import { CategoryDepthVO } from './dto/category-depth.vo';
import { CreateCategoryDto } from './dto/create-category.dto';
import { MoveCategoryDto } from './dto/move-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { CategoryRepository } from './entities/category.repository';
import { TransactionalZone } from 'src/common/decorators/transactional';

@Injectable()
export class CategoryService {
    constructor(
        private readonly categoryRepository: CategoryRepository,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    /**
     * 새로운 카테고리를 추가합니다.
     *
     * @param queryRunner 트랜잭션을 위해 Query Runner를 전달해주세요.
     * @param categoryName 카테고리 명
     * @param rootNodeName 루트 카테고리 명 (생략 가능)
     * @returns
     */
    async addCategory(categoryName: string, rootNodeName?: string) {
        return await this.categoryRepository.addCategory(
            categoryName,
            rootNodeName,
        );
    }

    async getCategoryList(): Promise<Category[]> {
        return await this.categoryRepository.getCategoryList();
    }

    /**
     * 카테고리를 깊이 값을 포함하여 계층형으로 출력합니다.
     *
     * @returns
     */
    private async selectTreeNodeList(): Promise<CategoryDepthVO[]> {
        return await this.categoryRepository.selectTreeNodeList();
    }

    /**
     * 마지막 깊이의 카테고리를 조회합니다.
     */
    private async selectLeafNodes(): Promise<Category[]> {
        return await this.categoryRepository.selectLeafNodes();
    }

    /**
     * 특정 카테고리의 부모 카테고리를 찾습니다.
     *
     * @param categoryName
     * @returns
     */
    private async selectParentNode(categoryName: string) {
        return await this.categoryRepository.selectParentNode(categoryName);
    }

    async getBreadcrumbs(categoryName: string) {
        return this.categoryRepository.getBreadcrumbs(categoryName);
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
    private async getDescendants(nodes: Category[], targetNode: Category) {
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
        return await this.categoryRepository.selectDescendants(categorId);
    }

    /**
     * 타겟 노드의 부모, 조상 노드 출력
     * @param nodes
     * @param targetNode
     * @returns
     */
    private async getAncestorsWithDepth(
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
    private async getNumberOfChildren(targetNode: CategoryDepthVO) {
        const n = (targetNode.right - (targetNode.left + 1)) / 2;

        return n;
    }

    private convrtWithData(data: CategoryDepthVO[]) {
        const result: any[] = [];

        const convertRecursive = (
            data: CategoryDepthVO[],
            parent?: CategoryDepthVO | null,
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

    async changeCategoryName(
        categoryId: number,
        { categoryName: newCategoryName }: ChangeCategoryDto,
    ) {
        return await this.categoryRepository.changeCategoryName(
            categoryId,
            newCategoryName,
        );
    }

    async getPostCountByCategories() {
        return await this.categoryRepository.getPostCountByCategories();
    }

    /**
     * 카테고리를 삭제합니다. (트랜잭션 사용 필요)
     *
     * @param categoryId
     * @param queryRunner
     * @returns
     */
    private async deleteNode(categoryId: number) {
        return this.categoryRepository.deleteNode(categoryId);
    }

    /**
     * ! 카테고리를 다른 카테고리의 하위 카테고리로 이동시킵니다.
     *
     * 1. 새로운 위치의 부모 노드의 ID 값과 기존 노드의 ID 값을 서버 API로 보낸다
     * 2. 새로운 위치의 부모 노드의 ID 하위에 새로운 노드를 추가한다.
     * 3. 새로운 노드의 왼쪽과 오른쪽 번호를 취한다.
     * 4. 기존 노드의 ID 값으로 기존 노드를 가지고 와서, 스왑(Swap) 용으로 데이터를 임시(temp) 노드로 저장해두고, 새로운 노드의 왼쪽과 오른쪽 번호로 업데이트 쿼리를 날린다.
     * 5. 새로운 노드는 temp 노드의 왼쪽과 오른쪽 번호로 업데이트 시킨다
     * 6. 새로운 노드를 삭제한다.
     * 7. 트리 구조를 유지한 상태로 위치 변경이 완료된다.
     *
     * @param prevCategoryId
     * @param newCategoryId
     */
    async moveCategory({
        newCategoryParentId,
        prevCategoryId,
    }: MoveCategoryDto) {
        let isSuccess = false;

        // const queryRunner = this.dataSource.createQueryRunner();

        // await queryRunner.connect();
        // await queryRunner.startTransaction();

        try {
            let qb: SelectQueryBuilder<Category>;
            let currentCategory: Category | null;

            // 이동할 위치에 부모 카테고리가 있는지 검증합니다.
            qb = this.categoryRepository.createQueryBuilder('node');
            qb.select().where('node.id = :id', {
                id: newCategoryParentId,
            });
            // .setQueryRunner(queryRunner);

            const parentCategory = await qb.getOne(); // << 수동으로 오류 처리를 위해 getOne()을 사용합니다.
            if (!parentCategory) {
                throw new BadRequestException(
                    '새로운 위치의 부모 노드가 존재하지 않습니다.',
                );
            }

            // 이동할 카테고리가 있는지 검증합니다.
            currentCategory = await this.categoryRepository.findOne({
                where: { id: prevCategoryId },
            });

            if (!currentCategory) {
                throw new BadRequestException(
                    '이동할 카테고리가 존재하지 않습니다.',
                );
            }

            // 2. 새로운 위치의 부모 노드의 ID 하위에 새로운 노드를 추가한다.
            const tempNewNodeName = `temp_${currentCategory.name}`;
            const newNodeInsertResult = (await this.addCategory(
                tempNewNodeName,
                parentCategory.name,
            )) as InsertResult;

            const newNodeId = newNodeInsertResult.identifiers.map(
                (e) => e.id,
            )[0];

            if (!newNodeId) {
                throw new BadRequestException(
                    '새로운 노드를 추가하는데 실패했습니다.',
                );
            }

            const newNode = await this.categoryRepository
                .createQueryBuilder('node')
                .select()
                .where('node.id = :id', { id: newNodeId })
                // .setQueryRunner(queryRunner)
                .getOne();

            if (!newNode) {
                throw new BadRequestException(
                    '새로운 노드를 찾을 수 없습니다.',
                );
            }

            // 3. 새로운 노드의 왼쪽과 오른쪽 번호를 취한다.
            const { left, right } = newNode;

            // 4. 기존 노드의 ID 값으로 기존 노드를 가지고 와서,
            // 스왑(Swap) 용으로 데이터를 임시(temp) 노드로 저장해두고,
            // 새로운 노드의 왼쪽과 오른쪽 번호로 업데이트 쿼리를 날린다.
            const { left: prevLeft, right: prevRight } = currentCategory;

            const tableAlias = this.categoryRepository.metadata.tableName;

            // ! typeorm의 update 쿼리는 tableColumn의 alias를 지원하지 않습니다 (일부 데이터베이스만 지원하기 때문에 아예 지원하지 않음)
            let updateResult = await this.categoryRepository
                .createQueryBuilder('category')
                .update(Category)
                .set({
                    left: prevLeft,
                    right: prevRight,
                })
                .where(`${tableAlias}.CTGR_SQ = :id`, { id: newNode.id })
                .useTransaction(true)
                // .setQueryRunner(queryRunner)
                .execute();

            if (!updateResult.affected) {
                throw new BadRequestException(
                    '기존 노드를 임시 노드로 업데이트하는데 실패했습니다.',
                );
            }

            // 5. 기존 노드를 새로운 노드의 왼쪽과 오른쪽 번호로 업데이트 시킨다
            updateResult = await this.categoryRepository
                .createQueryBuilder('category')
                .update(Category)
                .set({
                    left: left,
                    right: right,
                })
                .where(`${tableAlias}.CTGR_SQ = :id`, {
                    id: currentCategory.id,
                })
                .useTransaction(true)
                // .setQueryRunner(queryRunner)
                .execute();

            if (!updateResult.affected) {
                throw new BadRequestException(
                    '기존 노드를 이동하는 도중에 오류가 발생하였습니다.',
                );
            }

            // 6. 새로운 노드를 삭제한다.
            updateResult = await this.deleteNode(newNode.id);

            if (!updateResult.affected) {
                throw new BadRequestException(
                    '임시 노드를 삭제하는 도중에 오류가 발생하였습니다.',
                );
            }

            isSuccess = true;
        } catch (err) {
            console.error(err);

            isSuccess = false;
        }

        return {
            success: isSuccess,
        };
    }
}
