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
- [x] Phase 4 — Category (2026-06-10, 커스텀 리포지토리 → 서비스 흡수 + em.query raw SQL)
- [x] Phase 5 — TypeORM 제거 / 정리 (2026-06-19, entities/* 삭제 + image 도메인 완전
      포팅 + TypeORM 의존성 4종 제거 + 트랜잭션 stingerloom 전환. tsc/build 녹색,
      부팅 DI 그래프 54모듈 0에러. 실 DB/Redis 런타임 검증은 사용자 환경 필요 —
      [phase-5-cleanup.md](./phase-5-cleanup.md) 참조)

### 런타임 검증 (2026-06-10)

`scripts/verify-stingerloom-runtime.ts` — 격리 스크래치 DB(생성→synchronize→
검증→드롭)에서 Phase 3/4 의 위험 경로를 실제 MariaDB 로 실행하는 스크립트.
**20/20 통과** (Category 트리 불변식·moveCategory 롤백 경계·raw SQL,
PostComment pos/depth 시프트·soft/hard delete, PostSubscriber afterLoad).
전체 앱 부팅(`DB_HOST=127.0.0.1 DB_NAME=<scratch> node dist/src/main.js`)도
TypeORM + stingerloom 동시 기동으로 "successfully started" 확인.

이 과정에서 잡은 **stingerloom 0.23.0 런타임 함정 3종** (컴파일로는 안 잡힘):

1. **save() 가 미지정 컬럼을 NULL 로 INSERT** — 모든 메타데이터 컬럼이 INSERT
   에 포함되어 DB 기본값/`@Column({default})` 이 적용되지 않는다.
   → 도메인 서비스의 save 에 기본값 명시 (groupId/pos/depth/isValid/isPrivate/scope).
2. **save() RETURNING 하이드레이션이 raw 컬럼 키 반환** — PlainObjectDeserializer
   가 단순 Object.assign 이라 CTGR_SQ/post_id 같은 컬럼명이 프로퍼티로 매핑
   안 됨. → save 반환값을 소비하는 곳은 PK 만 읽고 find 경로로 재조회.
3. **`*JoinAndSelect` + getMany/getOne 이 루트 엔티티를 오염** — 조인 컬럼이
   AS 별칭 없이 SELECT 되어 중복 컬럼명(id 등)이 루트 값을 덮어쓰고, 관계
   중첩 하이드레이션도 안 됨. → 조인은 WHERE 필터 용도(plain join)로만 쓰고,
   하이드레이션은 `find({relations})` 2단계로 (중첩 `'user.profile'` 지원).

추가: User 도메인 엔티티의 updatedAt 이 `@CreateTimestamp` 중복으로 생성돼
있던 것을 `@UpdateTimestamp` 로 수정 (introspection 생성 잔재).

### 의존성 업그레이드 (2026-06-10)

- `@stingerloom/orm` 0.22.0 → **0.23.0** (breaking change 없음).
  - introspection MySQL EXTRA 누락 버그(cd30d50, PR #346) 정식 수정 포함 —
    재생성 시 EXTRA 보충 우회 불필요.
  - 주의: QB `paginate()` (#367) 는 v0.23.0 태그 **이후** 커밋이라 릴리스 미포함.
    페이지네이션은 기존 관용구(`getManyAndCount` + 어댑터) 유지.
- 0.23.0 의 d.ts 가 TS 5 문법(`const` 타입 파라미터)을 쓰므로
  `typescript` 4.9.5 → **5.9.3**, `ts-patch` ^2 → **^3** 동반 업그레이드.

### 의존성 업그레이드 (2026-09-05) — `@stingerloom/orm` 1.0.0 → **2.0.0**

브랜치 `feature/stingerloom-orm-2`. 2.0 은 "조용히 틀리던 상태를 예외/경고로 바꾼"
릴리스라 컴파일(tsc/nest build)은 수정 없이 녹색이었고, 런타임 동작 변경만 대응했다.
(업스트림 가이드: `docs/upgrade-2.0.md`, CHANGELOG 2.0.0)

- **relations 중첩 경로 거부 (실제 영향)** — `find({ relations: ['user', 'user.profile'] })`
  가 `InvalidQueryError` 를 던진다. 업스트림 소스 주석대로 중첩 경로는 1.x 에서도
  구현된 적이 없어 조용히 무시됐다(= `post.user.profile` 은 항상 undefined 였음.
  위 "런타임 검증" 3번의 "중첩 `'user.profile'` 지원" 은 잘못된 기록). 프론트
  (`blog-front` `PostHeader.tsx`, `PostService.getNickname`)와 RSS 가
  `post.user.profile.nickname` 을 소비하므로, 업스트림 안내대로 루트 관계(`user`)만
  로드하고 `ProfileService.attachProfiles()` 후속 쿼리 1회로 profile 을 붙인다.
  적용: `PostService.hydrateRelations/findOne`, `ApiKeyService.findWithUserProfile`
  (PostModule/ApiKeyModule 이 ProfileModule 을 import).
- **점검 후 영향 없음**: 루트 barrel 큐레이션(사용 심볼 전부 공개 API), `save()` 미존재
  PK → `EntityNotFoundError`(모든 save 가 INSERT 또는 findOneOrFail 후 UPDATE),
  where/orderBy 식별자 검증(전부 프로퍼티명), 엔티티 스코프 검사(12개 전부 등록),
  `take/limit: 0`(QB `.limit(size)` 만 사용, size 는 항상 > 0), 타임스탬프 Date 바인딩
  (mysql2 기본 timezone=local 이라 기존 문자열 포맷과 동일 순간), NestJS 종료 시
  풀 close(`enableShutdownHooks` 미사용 — 필요 시 도입 가능).
- **런타임 검증**: `scripts/verify-stingerloom-runtime.ts` 에 "[stingerloom 2.0 —
  동작 변경 검증]" 5건 추가 → **25/25 통과** (로컬 Docker MariaDB, 스크래치 DB).
  중첩 경로 InvalidQueryError / `relations:['user']`+attachProfiles / ApiKeyService
  user.profile / save 미존재 PK EntityNotFoundError / @CreateTimestamp round-trip.
- 참고: 프로젝트 ESLint 7 + prettier 3 조합이 Node 23 에서 크래시
  (`ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING`) — 업그레이드와 무관한 기존 환경 이슈.
