# Phase 5 — TypeORM 제거 / 정리

모든 엔티티가 stingerloom 으로 옮겨진 뒤 TypeORM 잔재를 제거한다.

## 작업

- [ ] `src/entities/` 전체 삭제 (모든 소비자가 `domain/*` 로 이동했는지 재확인 후).
- [ ] TypeORM 전용 모듈 제거: `DatabaseModule`, `OrmModule`(이미 deprecated),
      `TypeOrmExModule`, `typeorm-ex` 디렉터리.
- [ ] `PaginationProvider` / `pagination` 모듈을 stingerloom 기반으로 정리하거나 제거.
- [ ] `package.json` 의존성 제거: `typeorm`, `@nestjs/typeorm`, `typeorm-transactional`.
- [ ] `app.module.ts` 에서 `DatabaseModule`, `TransactionModule`(TypeORM 결합 시) 정리.
- [ ] `domain/domian.module.ts` → `domain.module.ts` 파일명 오타 수정.
- [ ] `src/domain/` 를 정규 위치로 정착 (필요 시 `entities` 이름 회수).
- [ ] 전체 테스트 + 빌드 녹색, 앱 부팅 확인.

## 완료 조건

- [ ] 코드베이스에 `typeorm` import 0건 (`grep`).
- [ ] 단일 ORM(stingerloom)로 빌드/테스트/부팅 성공.
