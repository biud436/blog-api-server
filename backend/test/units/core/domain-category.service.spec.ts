import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { CategoryService } from 'src/domain/category/category.service';
import { Category } from 'src/domain/category/category.entity';
import 'reflect-metadata';

/**
 * domain CategoryService 의 순수 트리 로직 단위 테스트.
 *
 * 중첩 집합 fixture:
 *   root(1,8) depth0
 *   ├── A(2,5) depth1
 *   │   └── A1(3,4) depth2
 *   └── B(6,7) depth1
 *
 * selectTreeNodeList / getBreadcrumbs 는 타입드 쿼리 빌더
 * (`repository.createQueryBuilder(...).getRawMany()`) 로 raw row 를 읽으므로,
 * 빌더 체인을 스텁으로 두고 `getRawMany()` 결과만 주입해 트리 조립 로직만
 * 검증한다. DB 변형 메서드(addCategory/deleteNode/moveCategory)는
 * @Transactional 컨텍스트가 필요해 런타임(DB 기동) 검증 대상으로 남긴다.
 */
describe('Domain CategoryService Unit Test', () => {
  const treeRows = [
    { id: 1, left: 1, right: 8, name: 'root', depth: 0 },
    { id: 2, left: 2, right: 5, name: 'A', depth: 1 },
    { id: 3, left: 3, right: 4, name: 'A1', depth: 2 },
    { id: 4, left: 6, right: 7, name: 'B', depth: 1 },
  ];

  let categoryService: CategoryService;
  /** 다음 `getRawMany()` 호출이 돌려줄 raw row 목록. 테스트마다 주입한다. */
  let rawResult: any[];

  beforeEach(() => {
    rawResult = treeRows;

    // 체이닝 가능한 쿼리 빌더 스텁: 모든 빌더 메서드는 자신을 반환하고,
    // getRawMany() 는 주입된 rawResult 를 돌려준다.
    const qbStub: any = new Proxy(
      {},
      {
        get(_t, prop) {
          if (prop === 'getRawMany') {
            return jest.fn(async () => rawResult);
          }
          // select/innerJoin/where/groupBy/addOrderBy/addSelectSubquery ...
          return jest.fn(() => qbStub);
        },
      },
    );

    const repositoryMock = {
      createQueryBuilder: jest.fn(() => qbStub),
    };

    categoryService = new CategoryService(
      repositoryMock as never,
      {} as never, // EntityManager — 본 테스트의 코드 경로에서는 미사용
    );
  });

  describe('getTreeChildren', () => {
    it('isBeautify=true 이면 중첩 집합을 계층 트리로 변환한다', async () => {
      const tree = await categoryService.getTreeChildren(true);

      expect(tree).toHaveLength(1);

      const root = tree[0];
      expect(root.name).toBe('root');
      expect(root.children.map((e) => e.name)).toEqual(['A', 'B']);

      const a = root.children[0];
      expect(a.children.map((e) => e.name)).toEqual(['A1']);

      const b = root.children[1];
      expect(b.children).toEqual([]);
    });

    it('isBeautify=false 이면 [name, parentName, depth] 행으로 평탄화한다', async () => {
      const rows = (await categoryService.getTreeChildren(false)) as unknown as [
        string,
        string,
        number,
      ][];

      expect(rows).toEqual([
        ['root', '', 0],
        ['A', 'root', 1],
        ['A1', 'A', 2],
        ['B', 'root', 1],
      ]);
    });

    it('MySQL 드라이버가 숫자를 문자열로 돌려줘도 트리를 만든다', async () => {
      rawResult = treeRows.map((row) => ({
        ...row,
        left: String(row.left),
        right: String(row.right),
        depth: String(row.depth),
      }));

      const tree = await categoryService.getTreeChildren(true);

      expect(tree[0].name).toBe('root');
      expect(tree[0].children.map((e) => e.name)).toEqual(['A', 'B']);
    });

    it('노드 목록이 비어 있으면 InternalServerErrorException', async () => {
      rawResult = [];

      await expect(categoryService.getTreeChildren(true)).rejects.toThrow(
        '노드 목록을 찾을 수 없습니다',
      );
    });
  });

  describe('getAncestors', () => {
    it('타겟 노드를 둘러싼 (left ≤, right ≥) 노드만 반환한다', async () => {
      const nodes = treeRows.map((row) =>
        Object.assign(new Category(), row),
      );
      const target = nodes[2]; // A1(3,4)

      const ancestors = await categoryService.getAncestors(nodes, target);

      // 자기 자신도 경계를 포함하므로 [root, A, A1]
      expect(ancestors.map((e) => e.name)).toEqual(['root', 'A', 'A1']);
    });
  });

  describe('getBreadcrumbs', () => {
    it('조상 경로를 " > " 로 연결한다', async () => {
      rawResult = [{ name: 'root' }, { name: 'A' }, { name: 'A1' }];

      const breadcrumbs = await categoryService.getBreadcrumbs('A1');

      expect(breadcrumbs).toBe('root > A > A1');
    });
  });
});
