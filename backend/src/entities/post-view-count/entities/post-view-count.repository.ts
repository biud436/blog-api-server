import { EntityRepository, Repository } from 'typeorm';
import { PostViewCount } from './post-view-count.entity';

@EntityRepository(PostViewCount)
export class PostViewCountRepository extends Repository<PostViewCount> {}
