import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  BaseRepository,
  EntityManager,
  Transactional,
  qAlias,
  sql,
} from '@stingerloom/orm';
import {
  InjectEntityManager,
  InjectRepository,
} from '@stingerloom/orm/nestjs';
import { ChangeCategoryDto } from 'src/controllers/admin/dto/change-category.dto';
import { CategoryDepthVO } from './dto/category-depth.vo';
import { MoveCategoryDto } from './dto/move-category.dto';
import { Category } from './category.entity';
import { Post } from '../post/post.entity';

/**
 * 중첩 집합(nested set) 트리 raw 쿼리 결과 행.
 * 실제 컬럼명: CTGR_SQ(id), CTGR_NM(name), LFT_NO(left), RGT_NO(right), CTGR_GRP_SQ(groupId)
 */
type TreeNodeRow = {
  id: number;
  left: number;
  right: number;
  name: string;
  depth: number;
};

type PostCountRow = TreeNodeRow & {
  children: number;
  postCount: number;
};

/**
 * 기존 TypeORM 커스텀 리포지토리(`CategoryRepository` + typeorm-ex)를
 * 서비스로 흡수한 stingerloom 포팅.
 *
 * 중첩 집합 셀프 조인 / 표현식 SELECT / 상관 서브쿼리는 모두 타입드 쿼리
 * 빌더로 표현한다 — raw `em.query` 없음:
 *   - 셀프 조인: `innerJoin(Category, alias, (j) => j.onBetween(...))`
 *   - 표현식 SELECT: `node.name.count().sub(1).as("depth")` 등 (`select([...])`)
 *   - 상관 서브쿼리: `addSelectSubquery((outer) => ...)`
 *   - 서브트리 DELETE: `em.delete(Category, { left: { between }, groupId })`
 * 표현식 SET(`RGT_NO ± n`)은 `createUpdateBuilder().setRaw`.
 * 빌더 실행은 raw 쿼리와 동일하게 `@Transactional()` 세션에 자동 합류한다.
 */
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: BaseRepository<Category>,
    @InjectEntityManager()
    private readonly em: EntityManager,
  ) {}

  /**
   * 새로운 카테고리를 추가합니다.
   *
   * 루트가 없으면 루트로 저장하고, 아니면 rootNodeName 노드의 마지막
   * 자식 위치에 좌/우 경계를 +2 벌려 삽입한다.
   */
  @Transactional()
  async addCategory(
    categoryName: string,
    rootNodeName?: string,
  ): Promise<Category> {
    const root = await this.categoryRepository.findOne({
      where: { left: 1 },
    });

    // 루트가 없으면 새로운 노드로 저장합니다.
    // groupId 명시: stingerloom save 는 미지정 컬럼을 NULL 로 INSERT 하므로
    // DB 기본값(1)에 기대지 못한다 (런타임 검증에서 확인).
    if (!root && !rootNodeName) {
      return await this.categoryRepository.save({
        name: categoryName,
        left: 1,
        right: 2,
        groupId: 1,
      });
    }

    // 부모 노드의 마지막 자식 위치(dist = parent.right - 1)를 구합니다.
    const parent = await this.categoryRepository.findOne({
      where: { name: rootNodeName },
    });

    if (!parent) {
      throw new InternalServerErrorException(
        '부모 카테고리를 찾을 수 없습니다.',
      );
    }

    const dist = parent.right - 1;
    const node = qAlias(Category, 'node');

    // 오른쪽을 +2
    await this.categoryRepository
      .createUpdateBuilder(node)
      .setRaw('right', sql`RGT_NO + 2`)
      .where(node.right.gt(dist))
      .execute();

    // 왼쪽을 +2
    await this.categoryRepository
      .createUpdateBuilder(node)
      .setRaw('left', sql`LFT_NO + 2`)
      .where(node.left.gt(dist))
      .execute();

    // 새로운 위치에 노드를 삽입합니다. save() 는 커스텀 컬럼명(CTGR_SQ 등)을
    // 프로퍼티 키로 매핑한 엔티티를 돌려주므로 재조회가 필요 없다.
    return await this.categoryRepository.save({
      name: categoryName,
      left: dist + 1,
      right: dist + 2,
      groupId: 1,
    });
  }

  async getCategoryList(): Promise<Category[]> {
    return await this.categoryRepository.find({
      orderBy: { left: 'ASC' },
    });
  }

  /**
   * 카테고리를 깊이 값을 포함하여 계층형으로 출력합니다.
   * (셀프 조인 + GROUP BY — 조상 수 = depth)
   */
  private async selectTreeNodeList(): Promise<TreeNodeRow[]> {
    const node = qAlias(Category, 'node');

    return (await this.categoryRepository
      .createQueryBuilder('node')
      .select([
        node.id.as('id'),
        node.left.as('left'),
        node.right.as('right'),
        node.name.as('name'),
        node.name.count().sub(1).as('depth'),
      ])
      .innerJoin(Category, 'parent', (j) =>
        j.onBetween('node.left', 'parent.left', 'parent.right'),
      )
      .groupBy(['node.left'])
      .addOrderBy('node.left', 'ASC')
      .getRawMany()) as TreeNodeRow[];
  }

  /**
   * 마지막 깊이(leaf)의 카테고리를 조회합니다. (right = left + 1)
   */
  private async selectLeafNodes(): Promise<Category[]> {
    const node = qAlias(Category, 'node');

    return await this.categoryRepository
      .createQueryBuilder('node')
      .where(node.right.eq(node.left.add(1)))
      .getMany();
  }

  /**
   * 특정 카테고리의 부모 카테고리를 찾습니다.
   * (조상 중 left 가 가장 큰 노드 = 직계 부모)
   */
  private async selectParentNode(
    categoryName: string,
  ): Promise<Category | undefined> {
    const category = qAlias(Category, 'category');

    const target = await this.categoryRepository
      .createQueryBuilder('category')
      .where(category.name.eq(categoryName))
      .getOne();

    if (!target) {
      throw new InternalServerErrorException('카테고리를 찾을 수 없습니다.');
    }

    const ancestors = await this.categoryRepository
      .createQueryBuilder('category')
      .where(category.left.lt(target.left))
      .andWhere(category.right.gt(target.left))
      .orderBy({ left: 'ASC' })
      .getMany();

    return ancestors.pop();
  }

  async getBreadcrumbs(categoryName: string): Promise<string> {
    const node = qAlias(Category, 'node');
    const parent = qAlias(Category, 'parent');

    const categories = (await this.categoryRepository
      .createQueryBuilder('node')
      .innerJoin(Category, 'parent', (j) =>
        j.onBetween('node.left', 'parent.left', 'parent.right'),
      )
      .select([parent.name.as('name')])
      .where(node.name.eq(categoryName))
      .addOrderBy('parent.left', 'ASC')
      .getRawMany()) as { name: string }[];

    return categories.map(({ name }) => name).join(' > ');
  }

  /**
   * 타겟 노드의 부모, 조상 노드 출력
   */
  async getAncestors(
    nodes: Category[],
    targetNode: Category,
  ): Promise<Category[]> {
    return nodes.filter(
      (node) =>
        node.left <= targetNode.left && node.right >= targetNode.right,
    );
  }

  /**
   * 자손 노드를 모두 출력합니다.
   */
  private async getDescendants(
    nodes: Category[],
    targetNode: Category,
  ): Promise<Category[]> {
    return nodes.filter(
      (node) =>
        node.left >= targetNode.left && node.right <= targetNode.right,
    );
  }

  async selectDescendants(categoryId: number): Promise<Category[]> {
    const node = qAlias(Category, 'node');

    const targetNode = await this.categoryRepository
      .createQueryBuilder('node')
      .where(node.id.eq(categoryId))
      .getOneOrFail();

    return await this.categoryRepository
      .createQueryBuilder('node')
      .where(node.left.between(targetNode.left, targetNode.right))
      .getMany();
  }

  /**
   * 타겟 노드의 부모, 조상 노드 출력 (깊이 포함 VO)
   */
  private getAncestorsWithDepth(
    nodes: CategoryDepthVO[],
    targetNode: CategoryDepthVO,
  ): CategoryDepthVO[] {
    return nodes.filter(
      (node) =>
        node.left <= targetNode.left && node.right >= targetNode.right,
    );
  }

  /**
   * 자식 노드의 갯수를 출력합니다.
   */
  private getNumberOfChildren(targetNode: CategoryDepthVO): number {
    return (targetNode.right - (targetNode.left + 1)) / 2;
  }

  private convrtWithData(data: CategoryDepthVO[]) {
    const result: any[] = [];

    const convertRecursive = (
      items: CategoryDepthVO[],
      parent?: CategoryDepthVO | null,
    ) => {
      items.forEach((item) => {
        const node = [item.name, parent?.name ?? '', item.depth];
        result.push(node);
        if (item.children) {
          convertRecursive(item.children, item);
        }
      });
    };
    convertRecursive(data, null);

    return result;
  }

  /**
   * 트리 구조를 출력합니다.
   *
   * 기존 구현의 plainToClass(class-transformer) 대신 Object.assign 으로
   * VO 인스턴스를 만든다 (domain 측 class-transformer 미사용 결정).
   */
  async getTreeChildren(isBeautify: boolean): Promise<CategoryDepthVO[]> {
    const nodeList = await this.selectTreeNodeList();
    if (!nodeList || nodeList.length <= 0) {
      throw new InternalServerErrorException('노드 목록을 찾을 수 없습니다');
    }

    const tree: CategoryDepthVO[] = [];
    const visited: CategoryDepthVO[] = [];

    const isRootNode = (node: CategoryDepthVO) => Number(node.left) === 1;

    for (const node of nodeList) {
      const nodeVO = Object.assign(new CategoryDepthVO(), node, {
        left: Number(node.left),
        right: Number(node.right),
        depth: Number(node.depth),
        children: [],
      });

      if (isRootNode(nodeVO)) {
        tree.push(nodeVO);
        visited.push(nodeVO);
      } else {
        const ancestors = this.getAncestorsWithDepth(visited, nodeVO);
        if (!ancestors || ancestors.length <= 0) {
          throw new InternalServerErrorException(
            '조상 노드를 찾을 수 없습니다',
          );
        }

        const parent = ancestors[ancestors.length - 1];
        parent.addChild(nodeVO);
        visited.push(nodeVO);
      }
    }

    return isBeautify ? tree : this.convrtWithData(tree);
  }

  async changeCategoryName(
    categoryId: number,
    { categoryName: newCategoryName }: ChangeCategoryDto,
  ): Promise<{ affected: number }> {
    return await this.categoryRepository.updateMany(
      { name: newCategoryName },
      { where: { id: categoryId } },
    );
  }

  /**
   * 카테고리별 포스트 수를 트리 메타(깊이/자식 수)와 함께 조회합니다.
   *
   * children = (right - (left + 1)) / 2,  depth = 조상 수 - 1,
   * postCount = 해당 서브트리(자손 포함)에 속한 포스트 수 — 상관 서브쿼리.
   */
  async getPostCountByCategories(): Promise<PostCountRow[]> {
    const node = qAlias(Category, 'node');
    const descendant = qAlias(Category, 'descendant');

    return (await this.categoryRepository
      .createQueryBuilder('node')
      .select([
        node.id.as('id'),
        node.name.as('name'),
        node.right.sub(node.left.add(1)).div(2).floor().as('children'),
        node.name.count().sub(1).as('depth'),
      ])
      // 서브트리 포스트 수: post ⨝ category(descendant), descendant 가 node 의
      // 좌/우 경계 안에 있는 포스트만 — 외부 node 행을 outer() 로 참조.
      .addSelectSubquery(
        (outer) =>
          this.em
            .createQueryBuilder(Post, 'post')
            .select([qAlias(Post, 'post').id.count().as('cnt')])
            .innerJoin(Category, 'descendant', (j) =>
              j.on('post.categoryId', '=', 'descendant.id'),
            )
            .where(
              descendant.left.between(
                outer('node.left'),
                outer('node.right'),
              ),
            ),
        'postCount',
      )
      .innerJoin(Category, 'parent', (j) =>
        j.onBetween('node.left', 'parent.left', 'parent.right'),
      )
      .groupBy(['node.left'])
      .addOrderBy('node.left', 'ASC')
      .getRawMany()) as PostCountRow[];
  }

  /**
   * 카테고리(및 그 서브트리)를 삭제하고 나머지 노드의 경계를 당겨옵니다.
   */
  @Transactional()
  private async deleteNode(categoryId: number): Promise<{ affected: number }> {
    const target = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });

    if (!target) {
      throw new InternalServerErrorException('삭제할 노드를 찾을 수 없습니다');
    }

    const { left, right, groupId } = target;
    const width = right - left + 1;

    // 서브트리 삭제
    await this.em.delete(Category, {
      left: { between: [left, right] },
      groupId,
    });

    const node = qAlias(Category, 'node');
    let affected = 0;

    // 나머지 노드를 당겨옵니다.
    const rightResult = await this.categoryRepository
      .createUpdateBuilder(node)
      .setRaw('right', sql`RGT_NO - ${width}`)
      .where(node.right.gt(right))
      .andWhere(node.groupId.eq(groupId))
      .execute();

    affected += rightResult.affected || 0;

    const leftResult = await this.categoryRepository
      .createUpdateBuilder(node)
      .setRaw('left', sql`LFT_NO - ${width}`)
      .where(node.left.gt(right))
      .andWhere(node.groupId.eq(groupId))
      .execute();

    affected += leftResult.affected || 0;

    return { affected };
  }

  /**
   * 카테고리를 다른 카테고리의 하위 카테고리로 이동시킵니다.
   *
   * 새 위치에 임시 노드 삽입 → 기존 노드와 좌/우 경계 스왑 → 임시 노드
   * 삭제. 기존 구현은 QueryRunner 주석 처리로 비-트랜잭션이었으나,
   * 의도대로 `@Transactional()` 로 묶어 실패 시 전체 롤백한다.
   */
  async moveCategory({
    newCategoryParentId,
    prevCategoryId,
  }: MoveCategoryDto): Promise<{ success: boolean }> {
    try {
      await this.moveCategoryOrFail(newCategoryParentId, prevCategoryId);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false };
    }
  }

  @Transactional()
  private async moveCategoryOrFail(
    newCategoryParentId: number,
    prevCategoryId?: number,
  ): Promise<void> {
    // 이동할 위치에 부모 카테고리가 있는지 검증합니다.
    const parentCategory = await this.categoryRepository.findOne({
      where: { id: newCategoryParentId },
    });

    if (!parentCategory) {
      throw new BadRequestException(
        '새로운 위치의 부모 노드가 존재하지 않습니다.',
      );
    }

    // 이동할 카테고리가 있는지 검증합니다.
    const currentCategory = await this.categoryRepository.findOne({
      where: { id: prevCategoryId },
    });

    if (!currentCategory) {
      throw new BadRequestException('이동할 카테고리가 존재하지 않습니다.');
    }

    // 새로운 위치의 부모 노드 하위에 임시 노드를 추가한다.
    const tempNewNodeName = `temp_${currentCategory.name}`;
    const newNode = await this.addCategory(
      tempNewNodeName,
      parentCategory.name,
    );

    if (!newNode?.id) {
      throw new BadRequestException('새로운 노드를 추가하는데 실패했습니다.');
    }

    // 임시 노드와 기존 노드의 좌/우 경계를 스왑한다.
    const { left, right } = newNode;
    const { left: prevLeft, right: prevRight } = currentCategory;

    const category = qAlias(Category, 'category');

    let updateResult = await this.categoryRepository
      .createUpdateBuilder(category)
      .set({ left: prevLeft, right: prevRight })
      .where(category.id.eq(newNode.id))
      .execute();

    if (!updateResult.affected) {
      throw new BadRequestException(
        '기존 노드를 임시 노드로 업데이트하는데 실패했습니다.',
      );
    }

    updateResult = await this.categoryRepository
      .createUpdateBuilder(category)
      .set({ left, right })
      .where(category.id.eq(currentCategory.id))
      .execute();

    if (!updateResult.affected) {
      throw new BadRequestException(
        '기존 노드를 이동하는 도중에 오류가 발생하였습니다.',
      );
    }

    // 임시 노드(기존 노드의 옛 위치)를 삭제한다.
    const deleteResult = await this.deleteNode(newNode.id);

    if (!deleteResult.affected) {
      throw new BadRequestException(
        '임시 노드를 삭제하는 도중에 오류가 발생하였습니다.',
      );
    }
  }
}
