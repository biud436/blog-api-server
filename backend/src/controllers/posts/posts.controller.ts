import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import {
  AdminOnly,
  CustomApiOkResponse,
  JwtGuard,
} from 'src/decorators/custom.decorator';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { PostsService } from './posts.service';

@Controller('posts')
@ApiTags('블로그 API')
@JwtGuard()
@AdminOnly()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @CustomApiOkResponse({
    operation: {
      summary: '새로운 포스트 작성',
      description: '새로운 포스트를 작성합니다',
    },
    description: '새로운 포스트를 작성합니다',
    auth: true,
    type: CreatePostDto,
  })
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      const data = await this.postsService.create(createPostDto);
      return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
    } catch (e) {
      return ResponseUtil.failure(RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  @CustomApiOkResponse({
    operation: {
      summary: '포스트 목록 가져오기',
      description: '포스트 목록을 가져옵니다.',
    },
    auth: false,
    description: '포스트 목록을 가져옵니다.',
  })
  async findAll(
    @Query('offset', ParseIntPipe) offset = 0,
    @Query('limit', ParseIntPipe) limit = 15,
  ) {
    try {
      const data = await this.postsService.findAll(+offset, +limit);
      return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
    } catch {
      return ResponseUtil.failure(RESPONSE_MESSAGE.NULL_VALUE);
    }
  }

  @Get(':id')
  @CustomApiOkResponse({
    operation: {
      summary: '특정 포스트 조회',
      description: '특정 포스트를 조회합니다.',
    },
    auth: false,
    description: '특정 포스트를 조회합니다.',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @CustomApiOkResponse({
    operation: {
      summary: '특정 포스트 수정',
      description: '특정 포스트를 수정합니다.',
    },
    auth: true,
    description: '특정 포스트를 수정합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포스트 ID',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @CustomApiOkResponse({
    operation: {
      summary: '특정 포스트 삭제',
      description: '특정 포스트를 삭제합니다.',
    },
    auth: true,
    description: '특정 포스트를 삭제합니다.',
  })
  @ApiParam({
    name: 'id',
    description: '포스트 ID',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(id);
  }
}
