import { Injectable } from '@nestjs/common';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { PostService } from 'src/entities/post/post.service';
import { RedisService } from 'src/common/micro-services/redis/redis.service';
import { QueryRunner } from 'typeorm';
import { PostSearchProperty } from './types/post-search-type';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { NoPostException, NotPublicPostException } from 'src/common/exceptions';
import { Transactional } from 'typeorm-transactional';

@Injectable()
export class PostsService {
  constructor(
    private readonly postService: PostService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * 포스트를 생성합니다.
   *
   * @param createPostDto
   * @param queryRunner
   * @returns
   */
  @Transactional()
  async create(createPostDto: CreatePostDto) {
    return await this.postService.create(createPostDto);
  }

  /**
   * 모든 글을 조회합니다.
   *
   * @param page
   * @param categoryId
   * @returns
   */
  async findAll(page: number, categoryId?: number) {
    try {
      const res = await this.postService.findAll(page, categoryId);

      return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
    } catch {
      throw new NoPostException();
    }
  }

  /**
   * 특정 포스트를 조회합니다.
   *
   * @param postId
   * @returns
   */
  async findOne(
    postId: number,
    ip: string,
    isPrivate?: boolean,
    anonymousId?: number,
  ) {
    try {
      let totalCount = '0';

      const item = await this.postService.findOne(
        postId,
        isPrivate,
        anonymousId,
      );

      // ip가 이미 조회한 ip인지 확인
      const isViewed = await this.redisService.isViewedPost(postId, ip);

      if (item) {
        if (!isViewed) {
          // 24시간 이내에 조회한 적이 없다면 조회수 증가
          await this.redisService.setViewedPost(postId, ip);
          await this.redisService.increasePostViewCount(postId);
        }

        totalCount = (await this.redisService.getPostViewCount(postId)) ?? '0';
      }

      const model = {
        ...item,
        viewCount: {
          count: parseInt(totalCount, 10),
        },
      };

      return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, model);
    } catch (e: any) {
      throw new NotPublicPostException();
    }
  }

  /**
   * 포스트 삭제
   *
   * @param postId
   * @param queuryRunner
   * @returns
   */
  async deleteOne(postId: number) {
    return await this.postService.deletePostById(postId);
  }

  /**
   * 포스트 검색
   *
   * @param pageNumber
   * @param searchProperty
   * @param searchQuery
   * @returns
   */
  async searchPost(
    pageNumber: number,
    searchProperty: PostSearchProperty,
    searchQuery: string,
  ) {
    const items = await this.postService.searchPost(
      pageNumber,
      searchProperty,
      searchQuery,
    );

    return items;
  }

  /**
   * 포스트를 삭제합니다.
   *
   * @param postId 포스트 ID
   * @returns
   */
  @Transactional()
  async deletePostById(postId: number) {
    const res = await this.deleteOne(postId);

    return ResponseUtil.success(RESPONSE_MESSAGE.DELETE_SUCCESS, res);
  }

  @Transactional()
  async updatePost(
    postId: number,
    userId: number,
    updatePostDto: UpdatePostDto,
  ) {
    updatePostDto.authorId = userId;
    const res = await this.postService.updatePost(postId, updatePostDto);
    return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
  }
}
