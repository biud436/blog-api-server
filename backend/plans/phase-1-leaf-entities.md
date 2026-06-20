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

## 진행 방식 변경 (2026-05-28)

사용자 결정: **교체가 아니라 공존**. 기존 `entities/*` TypeORM 서비스/모듈은
그대로 두고, `domain/*` 측에 동등한 로직의 서비스를 새로 작성해 둘 다 동시에
부팅되어 살아 있도록 한다. 소비자 import 갈아끼우기는 별개 단계로 미룬다.

## 완료 조건 (공존 모드)

- [x] 4개 엔티티의 `domain/*` 측 서비스 + 모듈 작성 (CategoryGroup 은 entities 측에도
      서비스가 없어 forFeature 만 유지).
- [x] `app.module.ts` 에 `domain/*` 4개 모듈을 alias import 로 추가 (기존 entities
      모듈도 그대로 유지).
- [x] `tsc --noEmit` + `nest build` 녹색.
- [ ] 관련 통합 테스트 녹색 (있다면) — 추후 동등성 검증 단계에서 다룸.
