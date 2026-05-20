# Phase 0 — stingerloom 연결 부트스트랩

## 목표

`StingerloomDatabaseModule` 을 `AppModule` 에 등록해, TypeORM 연결 옆에서 stingerloom
연결이 함께 부팅되도록 한다. 이 페이즈가 끝나야 이후 페이즈에서 stingerloom 리포지토리를
주입할 수 있다.

## 배경

- `StingerloomDatabaseModule` 은 작성되어 있으나 어디서도 import 되지 않아 휴면 상태.
- `StingerloomOrmModule.forRootAsync` 는 `global: true` 로 `EntityManager` 를 전역 제공.
- `synchronize: false` 이므로 부팅 시 스키마를 건드리지 않음 — TypeORM 과 안전하게 공존.

## 작업

- [x] `app.module.ts` 의 `imports` 에 `StingerloomDatabaseModule` 추가.
- [x] `tsc --noEmit` 녹색 확인.
- [x] `nest build` 녹색 확인.

## 검증

- [x] 타입체크 / 빌드 통과.
- [ ] (DB 접근 가능 환경에서) 앱 부팅 시 stingerloom 연결 로그 + 기존 기능 정상 확인.
      → DB 가 있는 환경에서 사용자가 직접 확인 필요.

## 메모

- `DomainModule`(`src/domain/domian.module.ts`, 파일명 오타) 은 12개 도메인 모듈을
  한꺼번에 묶지만, 공존 기간에는 통째로 import 하지 않는다. 엔티티별로 도메인 모듈을
  하나씩 `AppModule` 에 들이는 방식. 파일명 오타는 Phase 5 에서 정리.
- stingerloom 연결은 TypeORM 과 별도 커넥션 풀로 같은 MySQL/MariaDB 에 붙는다.
