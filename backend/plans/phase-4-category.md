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

- [x] stingerloom 에 커스텀 리포지토리 대응 방식 결정: **(a) 서비스에 메서드 흡수**.
      `domain/category/category.service.ts` 가 기존 `CategoryRepository` + `CategoryService` 를 합침.
- [x] 표현식 SET / `BETWEEN` / 셀프 조인 / 서브쿼리 포팅 (0.23 기준):
      - 셀프 크로스 조인 + GROUP BY (`selectTreeNodeList`, `getBreadcrumbs`,
        `getPostCountByCategories`) 와 서브트리 DELETE → `em.query` 태그드 템플릿
        raw SQL. `em.query` 는 `executeInTransaction` 경유라 `@Transactional()`
        세션에 자동 합류.
      - 표현식 SET(`LFT_NO + 2`, `RGT_NO - width`) → `createUpdateBuilder(ref).setRaw()`.
      - `BETWEEN` (selectDescendants) → `qAlias().col.between()`.
      - 컬럼 간 비교(leaf: `RGT_NO = LFT_NO + 1`) → `where(sql\`...\`)`.
- [x] `typeorm-ex` 의존 제거 — domain 측은 `BaseRepository` + `EntityManager` 만 사용.
- [ ] 소비자 교체: `posts.controller`, `posts/commands/category.command`, `admin.service`
      → 공존 모델에 따라 **Phase 5 로 이연**.
- [x] 트리 로직 단위 테스트: `test/units/core/domain-category.service.spec.ts`
      (getTreeChildren 트리 조립/평탄화/문자열 숫자 내성, getAncestors, getBreadcrumbs).
      addCategory/moveCategory/deleteNode 의 경계 불변식은 @Transactional 컨텍스트가
      필요해 런타임(DB) 검증으로 남김.

## 포팅 시 정리한 원본 동작

- `addCategory` 가 InsertResult/엔티티 혼합 반환하던 것 → 항상 `Category` 반환.
  `moveCategory` 는 반환된 엔티티의 left/right 를 그대로 사용 (재조회 제거).
- `moveCategory` 의 주석 처리된 QueryRunner (비-트랜잭션) → 내부
  `moveCategoryOrFail` 에 `@Transactional()`, 바깥에서 try/catch 로
  `{success}` 반환 유지. 실패 시 전체 롤백.
- `selectParentNode` 의 alias 불일치 버그('A' vs 'category') 수정 +
  `orderBy left ASC` 명시 (pop() = 직계 부모 보장).
- `plainToClass(CategoryDepthVO)` → `Object.assign(new CategoryDepthVO(), ...)`
  (domain 측 class-transformer 미사용 결정).

## 완료 조건

- [ ] Category 소비자 전부 `domain/*` 사용 → **Phase 5 로 이연** (공존 모델).
- [x] 트리 순수 로직 단위 테스트 녹색 (6/6).
- [x] `tsc --noEmit` + `nest build` 녹색.
