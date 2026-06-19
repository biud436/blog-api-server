/**
 * stingerloom 도메인 서비스 런타임 검증 스크립트.
 *
 * 격리된 스크래치 DB(blog_stingerloom_verify)를 만들어 synchronize 로 스키마를
 * 깔고, Phase 3/4 에서 포팅한 가장 위험한 경로들을 실제 MariaDB 에 대해 실행한다:
 *   - Category: 중첩 집합 addCategory/moveCategory(내부 deleteNode) 경계 불변식,
 *     raw SQL(셀프 크로스 조인/GROUP BY/서브쿼리), @Transactional 경유 실행
 *   - PostComment: 댓글 트리 pos/depth 시프트, soft/hard delete, QB 조인 하이드레이션
 *   - PostSubscriber: afterLoad previewContent
 *
 * 실행: corepack yarn ts-node --transpile-only -r tsconfig-paths/register \
 *         scripts/verify-stingerloom-runtime.ts
 * 종료 시 스크래치 DB 는 DROP 한다.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as mysql from 'mysql2/promise';
import removeMarkdown from 'markdown-to-text';
import { EntityManager, SnakeNamingStrategy } from '@stingerloom/orm';
import {
  StingerloomOrmModule,
  getEntityManagerToken,
} from '@stingerloom/orm/nestjs';
import { STINGERLOOM_DOMAIN_ENTITIES } from '../src/domain';
import { Category } from '../src/domain/category/category.entity';
import { CategoryModule } from '../src/domain/category/category.module';
import { CategoryService } from '../src/domain/category/category.service';
import { PostComment } from '../src/domain/post-comment/post-comment.entity';
import { PostCommentModule } from '../src/domain/post-comment/post-comment.module';
import { PostCommentService } from '../src/domain/post-comment/post-comment.service';
import { Post } from '../src/domain/post/post.entity';
import { PostSubscriber } from '../src/domain/post/post.subscriber';
import { Profile } from '../src/domain/profile/profile.entity';
import { User } from '../src/domain/user/user.entity';
import { CreateCommentDto } from '../src/domain/post-comment/dto/create-comment.dto';

dotenv.config({ path: `${__dirname}/../.env` });

const VERIFY_DB = 'blog_stingerloom_verify';
const HOST = '127.0.0.1'; // .env 의 DB_HOST 는 docker 네트워크 호스트명이라 오버라이드

const results: { name: string; ok: boolean; detail?: string }[] = [];

function check(name: string, cond: boolean, detail?: string) {
  results.push({ name, ok: cond, detail: cond ? undefined : detail });
  console.log(`${cond ? '  ✓' : '  ✗'} ${name}${cond ? '' : ` — ${detail}`}`);
}

@Module({
  imports: [
    StingerloomOrmModule.forRoot({
      type: 'mariadb',
      host: HOST,
      port: +(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      database: VERIFY_DB,
      entities: [...STINGERLOOM_DOMAIN_ENTITIES],
      namingStrategy: new SnakeNamingStrategy(),
      synchronize: true,
      logging: false,
    }),
    CategoryModule,
    PostCommentModule,
  ],
})
class VerifyModule {}

async function verifyCategoryTree(
  categoryService: CategoryService,
  em: EntityManager,
) {
  console.log('\n[Category — 중첩 집합 트리]');

  // FK 시드: category.CTGR_GRP_SQ → category_group(1)
  const { CategoryGroup } = await import(
    '../src/domain/category-group/category-group.entity'
  );
  await em.save(CategoryGroup, {
    name: 'default',
    description: 'verify',
  } as never);

  const root = await categoryService.addCategory('root');
  check(
    '루트 생성 (left=1, right=2)',
    root.left === 1 && root.right === 2,
    `save() 반환: ${JSON.stringify(root)}`,
  );

  const a = await categoryService.addCategory('A', 'root');
  const b = await categoryService.addCategory('B', 'root');
  const a1 = await categoryService.addCategory('A1', 'A');

  const byName = async () => {
    const list = await categoryService.getCategoryList();
    return Object.fromEntries(list.map((c) => [c.name, c]));
  };

  let nodes = await byName();
  check(
    '삽입 후 경계: root(1,8) A(2,5) A1(3,4) B(6,7)',
    nodes.root.left === 1 &&
      nodes.root.right === 8 &&
      nodes.A.left === 2 &&
      nodes.A.right === 5 &&
      nodes.A1.left === 3 &&
      nodes.A1.right === 4 &&
      nodes.B.left === 6 &&
      nodes.B.right === 7,
    JSON.stringify(
      Object.values(nodes).map((c: any) => [c.name, c.left, c.right]),
    ),
  );

  const tree = await categoryService.getTreeChildren(true);
  check(
    'getTreeChildren (raw 셀프 크로스 조인 + GROUP BY)',
    tree.length === 1 &&
      tree[0].name === 'root' &&
      tree[0].children.map((e) => e.name).join(',') === 'A,B' &&
      tree[0].children[0].children[0]?.name === 'A1',
  );

  const breadcrumbs = await categoryService.getBreadcrumbs('A1');
  check("getBreadcrumbs === 'root > A > A1'", breadcrumbs === 'root > A > A1', breadcrumbs);

  const descendants = await categoryService.selectDescendants(a.id);
  check(
    'selectDescendants(A) = [A, A1] (qAlias between)',
    descendants.map((e) => e.name).sort().join(',') === 'A,A1',
  );

  // A1 을 B 의 하위로 이동 (임시노드 삽입→스왑→deleteNode 의 다단계 raw/UpdateBuilder)
  const moveResult = await categoryService.moveCategory({
    newCategoryParentId: b.id,
    prevCategoryId: a1.id,
  });
  check('moveCategory 성공', moveResult.success === true);

  nodes = await byName();
  const all = Object.values(nodes) as Category[];
  const boundaries = all.flatMap((c) => [c.left, c.right]).sort((x, y) => x - y);
  check(
    '이동 후 불변식: 경계값 = 1..8 순열',
    boundaries.join(',') === '1,2,3,4,5,6,7,8',
    boundaries.join(','),
  );
  check(
    '이동 후: A1 이 B 내부, A 는 leaf',
    nodes.B.left < nodes.A1.left &&
      nodes.A1.right < nodes.B.right &&
      nodes.A.right === nodes.A.left + 1,
    JSON.stringify(all.map((c) => [c.name, c.left, c.right])),
  );
  check(
    '임시 노드(temp_*) 잔존 없음 (deleteNode 동작)',
    all.every((c) => !c.name.startsWith('temp_')),
  );

  const renamed = await categoryService.changeCategoryName(a.id, {
    categoryName: 'A-renamed',
  } as never);
  nodes = await byName();
  check(
    'changeCategoryName (updateMany)',
    renamed.affected === 1 && !!nodes['A-renamed'],
  );

  // 실패 경로: 존재하지 않는 부모로 이동 → {success:false} + 트리 무변화
  const before = JSON.stringify(
    (await categoryService.getCategoryList()).map((c) => [c.name, c.left, c.right]),
  );
  const failMove = await categoryService.moveCategory({
    newCategoryParentId: 999999,
    prevCategoryId: nodes.A1.id,
  });
  const after = JSON.stringify(
    (await categoryService.getCategoryList()).map((c) => [c.name, c.left, c.right]),
  );
  check('moveCategory 실패 시 {success:false} + 트리 무변화', !failMove.success && before === after);

  return { root: nodes.root };
}

async function verifyPostComment(
  postCommentService: PostCommentService,
  em: EntityManager,
  rootCategory: Category,
) {
  console.log('\n[PostComment — 댓글 트리 / Post — subscriber]');

  // FK 시드: profile → user → post
  const profile = await em.save(Profile, {
    email: 'verify@example.com',
    nickname: 'verifier',
  } as Partial<Profile>);
  const user = await em.save(User, {
    username: 'verifier',
    password: 'x',
    profileId: profile.id,
    isValid: true, // save 는 미지정 컬럼을 NULL 로 INSERT (DB 기본값 미적용)
  } as Partial<User>);
  const markdown = '# Hello **stingerloom** runtime';
  const post = await em.save(Post, {
    title: 'verify',
    content: markdown,
    authorId: user.id,
    categoryId: rootCategory.id,
    isPrivate: false,
  } as Partial<Post>);

  // subscriber afterLoad (find 경로)
  new PostSubscriber(em);
  const loaded = await em.findOne(Post, { where: { id: post.id } });
  const expectedPreview = removeMarkdown(markdown)?.slice(0, 100);
  check(
    'PostSubscriber.afterLoad → previewContent',
    loaded?.previewContent === expectedPreview,
    `got: ${loaded?.previewContent}`,
  );

  // 댓글 트리
  const c1 = await postCommentService.createComment(
    { postId: post.id, content: 'c1' } as CreateCommentDto,
    user.id,
  );
  check(
    '루트 댓글: parentId = 자기 id, pos=0, depth=0',
    c1.parentId === c1.id && (c1.pos ?? 0) === 0 && (c1.depth ?? 0) === 0,
    JSON.stringify({ id: c1.id, parentId: c1.parentId, pos: c1.pos, depth: c1.depth }),
  );

  const replyDto = (content: string): CreateCommentDto =>
    ({
      postId: post.id,
      content,
      parentId: c1.id,
      pos: c1.pos ?? 0,
      depth: c1.depth ?? 0,
    }) as CreateCommentDto;

  const c2 = await postCommentService.createComment(replyDto('c2'), user.id);
  check('첫 답글: depth=1, pos=1', c2.depth === 1 && c2.pos === 1, JSON.stringify(c2));

  const c3 = await postCommentService.createComment(replyDto('c3'), user.id);
  check('둘째 답글: depth=1, pos=2 (형제 뒤에 붙음)', c3.depth === 1 && c3.pos === 2, JSON.stringify(c3));

  const children = await postCommentService.findAllByParentId(post.id, c1.id, 1, 10);
  check(
    'findAllByParentId: [c2, c3] pos ASC + 페이지네이션 total=2',
    children.entities.map((e) => e.content).join(',') === 'c2,c3' &&
      children.pagination.totalCount === 2,
  );

  const allComments = await postCommentService.findAll(post.id, 1, 10);
  check(
    'findAll: user 관계 조인 하이드레이션',
    allComments.entities.length === 3 &&
      allComments.entities.every((e) => e.user?.username === 'verifier'),
    JSON.stringify(
      allComments.entities.map((e) => ({
        id: e.id,
        content: e.content,
        user: e.user,
      })),
    ),
  );

  // 작성자 검증
  let authorGuard = false;
  try {
    await postCommentService.deleteComment(post.id, c1.id, user.id + 999);
  } catch {
    authorGuard = true;
  }
  check('타인 댓글 삭제 → BadRequestException', authorGuard);

  // 자식 있는 댓글 → soft delete
  await postCommentService.deleteComment(post.id, c1.id, user.id);
  const softDeleted = await em.findOne(PostComment, { where: { id: c1.id } });
  check(
    '자식 있는 댓글: soft delete + 내용 마스킹',
    softDeleted?.content === '삭제된 댓글입니다.' && softDeleted?.deletedAt != null,
    JSON.stringify({ content: softDeleted?.content }),
  );

  // 자식 없는 댓글 → hard delete
  await postCommentService.deleteComment(post.id, c3.id, user.id);
  const hardDeleted = await em.findOne(PostComment, { where: { id: c3.id } });
  check('자식 없는 댓글: hard delete', hardDeleted === null || hardDeleted === undefined);
}

async function main() {
  const admin = await mysql.createConnection({
    host: HOST,
    port: +(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });
  await admin.query(`DROP DATABASE IF EXISTS ${VERIFY_DB}`);
  await admin.query(`CREATE DATABASE ${VERIFY_DB}`);
  console.log(`스크래치 DB ${VERIFY_DB} 생성, synchronize 로 스키마 적용...`);

  const app = await NestFactory.createApplicationContext(VerifyModule, {
    logger: ['error', 'warn'],
  });

  try {
    const categoryService = app.get(CategoryService);
    const postCommentService = app.get(PostCommentService);
    const em = app.get<EntityManager>(getEntityManagerToken());

    const { root } = await verifyCategoryTree(categoryService, em);
    await verifyPostComment(postCommentService, em, root);
  } finally {
    await app.close();
    await admin.query(`DROP DATABASE IF EXISTS ${VERIFY_DB}`);
    await admin.end();
    console.log(`\n스크래치 DB ${VERIFY_DB} 정리 완료.`);
  }

  const failed = results.filter((r) => !r.ok);
  console.log(`\n결과: ${results.length - failed.length}/${results.length} 통과`);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
