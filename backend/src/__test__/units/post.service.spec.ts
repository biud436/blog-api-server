import { describe, it, expect, beforeEach } from '@jest/globals';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { Post } from 'src/entities/post/entities/post.entity';
import { PostService } from 'src/entities/post/post.service';
import { Repository } from 'typeorm';
import { createMockQueryBuilder } from '../utils/mock-query-builder';
import { instance, mock, when } from '@johanblumenberg/ts-mockito';
import { Category } from 'src/entities/category/entities/category.entity';

describe('PostSevice Unit Test', () => {
    let postService: PostService;
    let postRepository: Repository<Post>;
    let categoryRepository: Repository<Category>;
    let mockPostQueryBuilder: any;
    let mockCategoryQueryBuilder: any;

    // Providers
    let redisService: RedisService;

    beforeEach(() => {
        mockPostQueryBuilder = createMockQueryBuilder();

        // eslint-disable-next-line prettier/prettier
        postRepository = mock(Repository<Post>);
        categoryRepository = mock(Repository<Category>);
        redisService = mock(RedisService);
    });
    
});
