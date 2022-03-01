import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CustomApiOkResponse, JwtGuard } from 'src/decorators/custom.decorator';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { PostsService } from './posts.service';

@Controller('posts')
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
  @JwtGuard()
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      const data = await this.postsService.create(createPostDto);
      return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
    } catch (e) {
      return ResponseUtil.failure(RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query('offset') offset = 0, @Query('limit') limit = 15) {
    try {
      const data = await this.postsService.findAll(+offset, +limit);
      return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
    } catch {
      return ResponseUtil.failure(RESPONSE_MESSAGE.NULL_VALUE);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
