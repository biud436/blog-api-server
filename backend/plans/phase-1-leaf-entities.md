# Phase 1 — leaf 엔티티

관계(FK)가 없거나 서비스가 작거나 없는 엔티티부터 옮긴다.

## 대상

### 1. CategoryGroup
- 기존 서비스 없음 (`category-group.module.ts` 는 `TypeOrmModule.forFeature` 뿐).
- 작업: `app.module.ts` 의 `CategoryGroupModule` import 를 `domain/category-group` 으로 교체.
- 주의: TypeORM `Category` 엔티티가 `@ManyToOne(() => CategoryGroup)` 으로 참조하므로,
  TypeORM 쪽 `CategoryGroup` 엔티티 클래스 자체는 Phase 4 까지 남겨둔다.

### 2. PostViewCount
- 기존 서비스: `create`, `findOne`. 관계 없음.
- 소비자: `common/domains/task/task.service.ts`.
- 작업: `domain/post-view-count/post-view-count.service.ts` 작성 → 소비자 import 교체.
- 주의: `findOne` 이 `deletedAt IS NULL` 을 거름. 신규 엔티티엔 `deletedAt` 컬럼이 없음
  → 해당 조건 제거 또는 컬럼 추가 여부 확인 필요.

### 3. ConnectInfo
- 기존 서비스: `create`, `findAll`(페이지네이션), `delete`. 관계 없음.
- 소비자: `controllers/auth/auth.service.ts`.
- 작업: `domain/connect-info/connect-info.service.ts` 작성 → 소비자 import 교체.
- **페이지네이션 결정 지점**: 기존 `PaginationProvider.getManyWithPagination` 대신
  stingerloom `repo.findWithPage` 로 옮기고, 반환 형태(`Paginatable<T>`)를 맞춘다.

### 4. Profile
- 기존 서비스: `isValidEmail`, `addProfile`. 관계 없음.
- 소비자: `controllers/auth/auth.service.ts`.
- 작업: `domain/profile/profile.service.ts` 작성 → 소비자 import 교체.
- 포팅 노트:
  - `isValidEmail` → `repo.exists({ email })` 또는 `repo.count(...)` 로 단순화.
  - `addProfile` 은 `QueryRunner` 를 받음 → 트랜잭션 경계는 호출부(`auth.service`)와
    함께 검토. Phase 1 에서는 단순 `repo.save` 로 시작하고 트랜잭션은 Phase 2 패턴 확정 후 반영.

## 완료 조건

- [ ] 4개 엔티티의 소비자가 모두 `domain/*` 서비스를 사용.
- [ ] `app.module.ts` 에서 해당 모듈 import 가 `domain/*` 로 교체됨.
- [ ] `tsc --noEmit` + `nest build` 녹색.
- [ ] 관련 통합 테스트 녹색 (있다면).
