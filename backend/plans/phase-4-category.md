# Phase 4 — Category (가장 복잡)

중첩 집합(Nested Set) 트리 모델. 커스텀 리포지토리 + 원시 QueryBuilder 다수.

## 왜 마지막인가

- `CategoryRepository` 가 TypeORM `Repository` 를 상속한 **커스텀 리포지토리**
  (`@CustomRepository`, `typeorm-ex` 모듈 의존).
- `left`/`right` 경계 계산, `BETWEEN`, 셀프 조인, 서브쿼리, raw `getRawMany` 다수.
- `update().set({ left: () => 'LFT_NO + 2' })` 같은 **표현식 SET** 사용.
- `moveCategory` 는 노드 스왑 + 다단계 UPDATE/DELETE.

## 대상 메서드 (CategoryRepository)

- `addCategory` — 루트 거리 계산 후 좌/우 +2, 신규 노드 INSERT
- `getCategoryList`, `selectTreeNodeList`(깊이 포함), `selectLeafNodes`
- `selectParentNode`, `getBreadcrumbs`, `selectDescendants`
- `changeCategoryName`, `getPostCountByCategories`(서브쿼리 2단), `deleteNode`

## 작업

- [ ] stingerloom 에 커스텀 리포지토리 대응 방식 결정:
      (a) 서비스에 메서드 흡수, (b) `BaseRepository` 확장 클래스.
- [ ] 표현식 SET / `BETWEEN` / 셀프 조인 / 서브쿼리를 stingerloom QueryBuilder 또는
      raw SQL(`em.query` / `sql``) 로 포팅. stingerloom 0.22 `em.ref()` 활용 검토.
- [ ] `typeorm-ex` 모듈(`TypeOrmExModule`) 의존 제거.
- [ ] 소비자 교체: `posts.controller`, `posts/commands/category.command`, `admin.service`.
- [ ] 중첩 집합 불변식(좌<우, 루트 left=1) 회귀 테스트 작성 — addCategory/moveCategory/deleteNode.

## 완료 조건

- [ ] Category 소비자 전부 `domain/*` 사용.
- [ ] 트리 CRUD 회귀 테스트 녹색.
- [ ] `tsc --noEmit` + `nest build` 녹색.
