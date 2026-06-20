# Phase 2 — 단일 관계 엔티티

`User` 또는 `Post` 로의 `@ManyToOne` 관계 하나를 가진 엔티티. 트랜잭션 패턴을 여기서 확정한다.

## 대상

### 1. BlogMetaData
- 관계: `@ManyToOne(() => User)`.
- 기존 서비스: `findOne(userId)`, `findOneByUsername`(user 조인).
- 작업: 조인 쿼리를 stingerloom QueryBuilder 또는 `find({ relations })` 로 포팅.

### 2. Admin
- 관계: `@ManyToOne(() => User)`.
- 기존 서비스: `isAdmin(username)` — `count({ relations:['user'], where:{ user:{ username }}})`.
- 소비자: `controllers/auth/auth.service.ts`.
- 작업: 중첩 where(`user.username`) 를 stingerloom 에서 지원하는지 확인 후 포팅.

### 3. Image
- 관계: `@ManyToOne(() => Post)`.
- 구조: command 패턴(`controllers/image/commands/*`) + `image.service.ts`.
- 작업: command 들이 쓰는 리포지토리 호출을 stingerloom 으로 교체.

### 4. ApiKey
- 관계: `@ManyToOne(() => User)`.
- 기존 서비스: 큰 편(~230줄). `@Cron`, QueryBuilder UPDATE, **수동 `QueryRunner` 트랜잭션**.
- **트랜잭션 패턴 확정 지점**: `typeorm-transactional` / `QueryRunner` 를 stingerloom
  `EntityManager` 트랜잭션 API 로 옮기는 표준 방식을 여기서 정하고 문서화한다.
  이후 Phase 3 (`Post`, `PostComment`) 가 이 패턴을 재사용한다.

## 완료 조건 (공존 모드)

- [x] 4개 엔티티의 `domain/*` 측 서비스/모듈 작성 (BlogMetaData, Admin, Image, ApiKey).
- [x] 트랜잭션 표준 패턴 확정 (아래 참조).
- [x] `tsc --noEmit` + `nest build` 녹색.
- [ ] 관련 통합 테스트 녹색 — 동등성 검증 단계에서.

## 트랜잭션 표준 패턴 (2026-05-28 확정)

stingerloom 측에서는 typeorm-transactional 의 `@Transactional()` 와 동일한
방식의 **메서드 데코레이터** 를 사용한다. `@stingerloom/orm` 에서 제공:

```ts
import { Transactional } from '@stingerloom/orm';

@Injectable()
export class ApiKeyService {
  @Transactional()
  async updateApiKey(...): Promise<...> {
    // 내부의 모든 repo 호출이 AsyncLocalStorage 로 같은 tx 공유
    const item = await this.repo.findOneOrFail({ where: { id } });
    await this.repo.updateMany({...}, { where: { id } });
    return await this.findOneById(id);   // 같은 tx 안에서 join 흐름
  }
}
```

전파 옵션:
- `@Transactional()` (기본 REQUIRED): 진행 중 tx 있으면 합류, 없으면 새로 시작.
- `@Transactional({ propagation: TransactionPropagation.REQUIRES_NEW })`: 새 tx 강제.
- `@Transactional({ propagation: TransactionPropagation.NESTED })`: 세이브포인트.
- 격리수준: `@Transactional("SERIALIZABLE")` 또는 옵션 객체의 `isolationLevel`.

기존 entities/* 의 수동 `dataSource.createQueryRunner()` + `startTransaction`
/`commitTransaction`/`rollbackTransaction`/`release` 4단계 보일러플레이트를
**한 줄 데코레이터로 대체**한다. 트랜잭션 내부 호출 사이에 `queryRunner`
인자를 명시적으로 넘기던 부분도 모두 사라진다 — AsyncLocalStorage 가 자동 전파.

Phase 3 의 `Post` / `PostComment` 등 트랜잭션이 필요한 모든 도메인 서비스가
이 패턴을 그대로 따른다.
