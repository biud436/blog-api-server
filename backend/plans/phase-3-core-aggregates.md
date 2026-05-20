# Phase 3 — 핵심 집합체

관계가 많고 서비스가 크며 다수 컨트롤러가 의존하는 엔티티.

## 대상

### 1. User
- 관계: `@OneToOne(() => Profile)` + `@OneToMany` 5개(Post, Admin, ApiKey, BlogMetaData, PostComment).
- 서비스: ~135줄.
- 소비자: 파이프 3개, `auth.service`, `local.strategy`, `image-temp.command`.
- 작업: 소비자가 많으므로 import 교체 누락 없도록 일괄 검색 후 교체.

### 2. PostComment
- 관계: `@ManyToOne(() => Post)`, `@ManyToOne(() => User)`, `parentId`(자기참조 깊이/위치).
- 서비스: ~403줄.
- 소비자: `controllers/comment/comment.service.ts`.
- 작업: 댓글 트리(parentId/pos/depth) 로직 — 카테고리만큼은 아니나 주의.

### 3. Post
- 관계: `@ManyToOne(() => User/Category)`, `@OneToMany`(PostComment, Image), soft delete(`deletedAt`).
- 서비스: ~417줄 + `post.subscriber.ts`.
- 소비자: `posts.service`, `rss.service`, `api.service`.
- 작업:
  - TypeORM `EntitySubscriber` → stingerloom `EntitySubscriber` / 이벤트로 포팅.
  - soft delete 동작(`@DeletedAt`) 확인.
  - Phase 2 에서 확정한 트랜잭션 패턴 재사용.

## 완료 조건

- [ ] 3개 엔티티 소비자 전부 `domain/*` 사용.
- [ ] subscriber 동작 포팅 검증.
- [ ] `tsc --noEmit` + `nest build` 녹색.
- [ ] 관련 테스트 녹색.
