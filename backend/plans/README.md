# TypeORM → stingerloom-orm 점진적 마이그레이션

## 목표

블로그 API 서버의 ORM을 TypeORM 0.3 에서 `@stingerloom/orm` 0.23 로 **점진적으로** 단일화한다.
한 번에 바꾸지 않고, 두 ORM이 같은 DB를 바라보며 **공존**하는 상태에서 엔티티 단위로 옮긴다.

## 현재 구조 (공존)

| 구분 | 위치 | ORM | 상태 |
|------|------|-----|------|
| 기존 | `src/entities/<도메인>/` | TypeORM | 운영 중 (서비스 + 모듈 + DTO) |
| 신규 | `src/domain/<도메인>/` | stingerloom | 엔티티 12개 + `forFeature` 모듈만 존재, 서비스 미작성 |

- 기존 ORM 연결: `common/modules/database/database.module.ts` (`DatabaseModule`)
- 신규 ORM 연결: `common/modules/stingerloom-database/stingerloom-database.module.ts` (`StingerloomDatabaseModule`)
- 두 연결 모두 `synchronize: false` 로 같은 DB 스키마를 읽는다. 스키마 변경 없음.

## 마이그레이션 규칙

1. **엔티티 단위**로 옮긴다. 한 엔티티가 끝나면 빌드 + 테스트가 녹색이어야 다음으로 간다.
2. 신규 서비스는 `src/domain/<도메인>/<도메인>.service.ts` 에 작성하고, stingerloom
   Repository API 로 포팅한다. 리포지토리는 `@stingerloom/orm/nestjs` 의
   `@InjectRepository(Entity)` 로 주입한다.
3. 소비자(컨트롤러/파이프/전략)는 `import` 경로만 `entities/...` → `domain/...` 으로 교체한다.
4. `app.module.ts` 는 해당 엔티티의 모듈 import 한 줄을 기존 → 신규로 바꾼다.
5. 모든 소비자가 옮겨진 엔티티의 `src/entities/<도메인>/` 는 Phase 5 에서 일괄 삭제한다.
6. **쉬운 것(관계 없는 leaf 엔티티)부터, 카테고리(중첩 집합 트리)는 마지막에.**

## 페이즈

| Phase | 범위 | 난이도 | 문서 |
|-------|------|--------|------|
| 0 | stingerloom 연결 부트스트랩 | 낮음 | [phase-0-bootstrap.md](./phase-0-bootstrap.md) |
| 1 | leaf 엔티티: CategoryGroup, PostViewCount, ConnectInfo, Profile | 낮음 | [phase-1-leaf-entities.md](./phase-1-leaf-entities.md) |
| 2 | 단일 관계 엔티티: BlogMetaData, Admin, Image, ApiKey | 중간 | [phase-2-related-entities.md](./phase-2-related-entities.md) |
| 3 | 핵심 집합체: User, PostComment, Post | 높음 | [phase-3-core-aggregates.md](./phase-3-core-aggregates.md) |
| 4 | Category (중첩 집합 트리 + 커스텀 리포지토리) | 매우 높음 | [phase-4-category.md](./phase-4-category.md) |
| 5 | TypeORM 제거 / 정리 | 중간 | [phase-5-cleanup.md](./phase-5-cleanup.md) |

## 알아둘 stingerloom API 차이 (포팅 시)

- `@InjectRepository` 출처: `@nestjs/typeorm` → `@stingerloom/orm/nestjs`
- `repo.create(dto)` 없음 → 평범한 객체를 만들어 `repo.save(obj)` 에 넘긴다.
- `repo.delete(criteria)` 는 where 절을 받는다. soft delete 는 `repo.softDelete` / `repo.restore`.
- `repo.count(where)`, `repo.exists(where)`, `repo.findAndCount`, `repo.findWithPage` 제공.
- 트랜잭션: `typeorm-transactional` 의 `@Transactional()` / `QueryRunner` 대신
  `EntityManager` 기반. Phase 2(ApiKey)에서 패턴을 확정한다.
- 페이지네이션: 기존 `PaginationProvider` 는 TypeORM `SelectQueryBuilder` 결합.
  stingerloom 은 `repo.findWithPage` 내장. Phase 1(ConnectInfo)에서 어댑터 방향 결정.
- 신규 `domain/*` 엔티티에는 `@Exclude()` 가 없어, 과거 Deserializer 이슈는 해당 없음.

## 진행 방식 (2026-05-28 정정)

원래 README 는 "기존 → 신규로 import 교체" 모델이었지만, 사용자 결정으로
**공존 + 동등 구현** 모델로 변경한다:

- 기존 `entities/*` TypeORM 서비스/모듈은 그대로 둔다.
- `domain/*` 측에 같은 로직의 stingerloom 서비스를 새로 작성한다.
- 양쪽 모듈을 모두 `AppModule.imports` 에 등록해 둘 다 부팅된다.
- 소비자(컨트롤러/도메인 서비스) 의 import 갈아끼우기 + entities/* 삭제는
  Phase 5 (정리) 단계에서 일괄.

따라서 각 Phase 완료 조건은 "domain/* 서비스/모듈 작성 + AppModule 등록 +
빌드 녹색" 으로 단순화한다.

## 진행 상황

- [x] Phase 0 — stingerloom 연결 부트스트랩
- [x] Phase 1 — leaf 엔티티 (domain 측 서비스/모듈 작성, AppModule 등록)
- [x] Phase 2 — 단일 관계 엔티티 (트랜잭션 패턴 = `@Transactional()` 데코레이터 확정)
- [x] Phase 3 — 핵심 집합체 (User 2026-05-31, PostComment/Post + subscriber 2026-06-10)
- [ ] Phase 4 — Category
- [ ] Phase 5 — TypeORM 제거 / 정리

### 의존성 업그레이드 (2026-06-10)

- `@stingerloom/orm` 0.22.0 → **0.23.0** (breaking change 없음).
  - introspection MySQL EXTRA 누락 버그(cd30d50, PR #346) 정식 수정 포함 —
    재생성 시 EXTRA 보충 우회 불필요.
  - 주의: QB `paginate()` (#367) 는 v0.23.0 태그 **이후** 커밋이라 릴리스 미포함.
    페이지네이션은 기존 관용구(`getManyAndCount` + 어댑터) 유지.
- 0.23.0 의 d.ts 가 TS 5 문법(`const` 타입 파라미터)을 쓰므로
  `typescript` 4.9.5 → **5.9.3**, `ts-patch` ^2 → **^3** 동반 업그레이드.
