import { Injectable } from '@nestjs/common';
import removeMarkdown from 'markdown-to-text';
import { EntityManager, EntitySubscriber } from '@stingerloom/orm';
import { InjectEntityManager } from '@stingerloom/orm/nestjs';
import { Post } from './post.entity';

/**
 * 로드 시 content 에서 markdown 을 제거한 previewContent 를 채운다.
 *
 * stingerloom 의 afterLoad 는 find/findOne 경로에서만 발화하고
 * QueryBuilder 결과에는 발화하지 않으므로, QB 기반 조회를 쓰는
 * PostService 쪽에서는 withPreview() 로 같은 계산을 적용한다.
 */
@Injectable()
export class PostSubscriber implements EntitySubscriber<Post> {
  constructor(@InjectEntityManager() private readonly em: EntityManager) {
    this.em.addSubscriber(this);
  }

  listenTo() {
    return Post;
  }

  afterLoad(post: Post): void {
    post.previewContent = removeMarkdown(post.content)?.slice(0, 100);
  }
}
