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

## 완료 조건

- [ ] 4개 엔티티 소비자가 `domain/*` 서비스 사용.
- [ ] 트랜잭션 표준 패턴 문서화 (이 파일 하단 또는 reference 노트).
- [ ] `tsc --noEmit` + `nest build` 녹색.
- [ ] 관련 테스트 녹색.

## 트랜잭션 패턴 (확정 후 기록)

> ApiKey 작업 시 채워 넣을 것.
