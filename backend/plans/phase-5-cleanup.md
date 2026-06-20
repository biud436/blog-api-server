# Phase 5 — TypeORM 제거 / 정리 (완료 2026-06-19)

모든 엔티티가 stingerloom 으로 옮겨진 뒤 TypeORM 잔재를 제거한다.

## 작업

- [x] `src/entities/` 전체 삭제 (모든 소비자가 `domain/*` 로 이동했는지 재확인 후).
      - 공유 자산(DTO/VO)은 `entities/<도메인>/dto` → `domain/<도메인>/dto` 로 이동
        (`comment` → `post-comment` 폴더 매핑 포함). 소비자/도메인 서비스 import 일괄 repoint.
      - 결합 DTO 2건 정리: `CreateApiKeyDto extends ApiKey` 를 domain ApiKey 엔티티로
        repoint(HTTP 바디 엔드포인트 없음 → class-transformer 동작 변화 없음),
        `CreatePostDto` 의 미사용 `PostViewCount` import 제거.
- [x] TypeORM 전용 모듈 제거: `DatabaseModule`, `OrmModule`, `TypeOrmExModule`,
      `TransactionModule`(커스텀 AOP 트랜잭션 전체), `typeorm-ex` 디렉터리.
- [x] `PaginationProvider` / `pagination` 모듈 제거 (app.module 외 소비자 없음.
      도메인은 `common/config/list-config` 의 `Paginatable` 사용).
- [x] `package.json` 의존성 제거: `typeorm`, `@nestjs/typeorm`,
      `typeorm-transactional`, `typeorm-naming-strategies`. `yarn install` 로
      50개 패키지(-6.21 MiB) 제거.
- [x] `app.module.ts` 정리: `DatabaseModule`/`TransactionModule`/`OrmModule`/
      `TypeOrmExModule`/`PaginationModule` 및 중복 `Domain*` alias import 제거,
      entities 모듈 import → domain 모듈로 repoint (모듈당 1회 등록).
- [x] `domain/domian.module.ts` → `domain.module.ts` 파일명 오타 수정.
- [x] image 도메인 완전 포팅 (TypeORM 제거의 핵심 차단 요소였음):
      - TypeORM `Image` 엔티티가 `@ManyToOne(() => Post)` 로 TypeORM Post 에 결합 →
        entities/post 삭제하려면 image 를 stingerloom 으로 옮겨야 함.
      - domain `ImageService` 를 완전한 facade 로 확장 (`upload`, `getTempImageFileName`
        추가; 기존 create/findByIds/updatePostId/deleteByIds 유지). RedisService +
        domain UserService 주입.
      - `controllers/image` 의 TypeORM facade service + 커맨드 6종(create/find/
        update/delete/upload/temp) + `entities/image.entity` 삭제. 순수 HTTP 인
        `image-create-svg.command` 만 유지. 컨트롤러/인터셉터/s3 를 domain image 로 repoint.
      - controllers `ImageModule` 은 컨트롤러 전용 얇은 모듈로 재작성
        (DomainImageModule + **UserModule**(domain) + HttpModule + MicroServicesModule).
        ※ UserModule 누락이 부팅 시 `ParseUserIdPipe`(UserService 의존) DI 에러로
        드러났고 보강함 — tsc/build 로는 안 잡히는 런타임 배선 문제.
- [x] 소비자 트랜잭션 전환: `auth.service.signUp`(@deprecated) 의 TypeORM QueryRunner →
      stingerloom `@Transactional()` (DataSource 주입 제거). `task.service` 의 cron
      QueryRunner → `@Transactional()`. 4개 컨트롤러 서비스(admin/api/comment/posts)의
      `@Transactional` import 출처를 `typeorm-transactional` → `@stingerloom/orm` 로 교체.
- [x] `nest-bootstrap.application.ts` 의 `initializeTransactionalContext` 제거
      (stingerloom @Transactional 은 자동 ALS).
- [x] 잔재 정리: `common/config/config.ts`(TypeORM 연결 옵션, 미사용),
      `virtual-column.decorator`(TypeORM Column 기반, 미사용) 삭제.
- [x] 폐기 테스트 삭제: `test/units/core/post.service.spec.ts` (TypeORM PostService
      전용 + 삭제된 image 커맨드 mock). 도메인 측은 `domain-category.service.spec.ts`
      + 스크래치 DB 런타임 스크립트가 커버.

## 완료 조건

- [x] 코드베이스에 `typeorm` import 0건 (`grep`). 남은 `typeorm` 문자열은
      `category.service.ts` 의 마이그레이션 이력 주석 1건뿐.
- [x] 단일 ORM(stingerloom)로 빌드 성공: `tsc --noEmit` + `nest build` 녹색.
- [x] 단위 테스트: 16 pass / 3 fail. 실패 3건은 `date.spec.ts` 의 **사전 존재 결함**
      (parseInt 관련, ORM 무관 — 마이그레이션 전부터 실패).
- [x] **부팅 DI 그래프 검증**: 빌드 산출물을 닫힌 로컬 DB 로 부팅 → NestJS
      InstanceLoader 가 54개 모듈(모든 domain 모듈 + StingerloomOrm/Database 모듈
      포함) 전부 초기화, **DI 해결 에러 0건**. 외부 서비스(Redis 6379, 이어서 DB)
      연결에서만 멈춤 = 배선은 정상.
- [ ] **실 DB/Redis 런타임 검증 (사용자 환경 필요)**: 이 샌드박스엔 로컬
      MariaDB/Redis/Docker 가 없어 실행 불가. 사용자 환경에서 아래를 실행해
      최종 확인 권장:
      - 스크래치 DB 검증: `DB_HOST=127.0.0.1 DB_NAME=<scratch> corepack yarn ts-node \
        --transpile-only -r tsconfig-paths/register scripts/verify-stingerloom-runtime.ts`
      - 전체 부팅: 로컬 MariaDB+Redis 기동 후 `DB_HOST=127.0.0.1 corepack yarn start`
      - (image `upload`/`getTempImageFileName` facade 신규 경로는 S3+Redis+DB 필요)
