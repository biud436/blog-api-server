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

## 완료 조건 (2026-05-28 공존 모델 기준으로 재해석)

- [x] 3개 엔티티 domain 서비스/모듈 작성 + AppModule 등록 (소비자 교체는 Phase 5).
- [x] subscriber 동작 포팅 (아래 참고).
- [x] `tsc --noEmit` + `nest build` 녹색.
- [ ] 관련 테스트 녹색 (런타임 검증은 DB 기동 시).

## 진행 기록

- **User** (2026-05-31): `domain/user/user.service.ts`. qAlias QB + `whereHas('admins')`,
  OneToMany 는 QB id 조회 → `find(relations)` 2단계. 비밀번호는 create 에서 bcrypt.
- **PostComment** (2026-06-10): `domain/post-comment/post-comment.service.ts`.
  - 댓글 트리(parentId/pos/depth) 로직 포팅. 형제 pos 시프트는
    `createUpdateBuilder(ref).setRaw('pos', sql\`pos + 1\`)`.
  - `createComment`/`deleteComment` 는 `@Transactional()` — 기존의 QueryRunner
    인자 전파(isAncestor) 제거.
  - 페이지네이션: `getManyAndCount` + toPaginatable 어댑터 (paginate() 미릴리스).
- **Post** (2026-06-10): `domain/post/post.service.ts` + `post.subscriber.ts`.
  - subscriber: stingerloom `EntitySubscriber.afterLoad` 로 previewContent 계산.
    **주의** — stingerloom 의 afterLoad 는 find/findOne 경로에서만 발화하고 QB
    결과에는 발화하지 않으므로, QB 기반 메서드는 서비스의 `withPreview()` 로 보완.
  - soft delete: domain 엔티티의 `@DeletedAt` 가 find/QB 에서 자동 필터
    (기존의 명시적 `deletedAt IS NULL` 과 동등). `repo.delete` 는 hard delete 유지.
  - updatedAt 갱신은 UpdateQueryBuilder 의 `@UpdateTimestamp` 자동 주입.
  - 이미지 연결: save cascade 대신 domain `ImageService.updatePostId` 명시 호출.
    S3 삭제는 `S3Service.deleteFile` 직접 호출 + domain `ImageService.deleteByIds`.
  - 카테고리 하위 트리: `selectCategoryDescendants` 를 PostService 내부에 임시
    구현 (nested set BETWEEN). Phase 4 에서 domain CategoryService 로 이동.
  - 기존 `findAllByUserId` 의 존재하지 않는 `post.userId` 컬럼 참조는
    의도대로 `author_id` 필터로 정정.
