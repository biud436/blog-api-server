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
    Logger,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/typeorm';
import { PaginationConfig } from 'src/common/list-config';
import { DocsMapper } from 'src/common/swagger-config';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/decorators/custom.decorator';
import { Limit } from 'src/decorators/limit.decorator';
import { Offset } from 'src/decorators/offset.decorator';
import { PageNumber } from 'src/decorators/page-number.decorator';
import { CreatePostDto } from 'src/entities/post/dto/create-post.dto';
import { UpdatePostDto } from 'src/entities/post/dto/update-post.dto';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { Connection } from 'typeorm';
import { PostsService } from './posts.service';

@Controller('posts')
@ApiTags('블로그 API')
@JwtGuard()
@AdminOnly()
export class PostsController {
    private logger: Logger = new Logger(PostsController.name);

    constructor(
        private readonly postsService: PostsService,
        @InjectConnection() private readonly connection: Connection,
    ) {}

    @Get(':id')
    @CustomApiOkResponse(DocsMapper.posts.GET.findOne)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        try {
            const model = await this.postsService.findOne(id);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, model);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    @Patch(':id')
    @CustomApiOkResponse(DocsMapper.posts.PATCH.update)
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
    @CustomApiOkResponse(DocsMapper.posts.DELETE.remove)
    @ApiParam({
        name: 'id',
        description: '포스트 ID',
    })
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.postsService.remove(id);
    }

    // !==========================================================
    // ! Post와 Get Mapping은 맨 아래에 배치해야 합니다.
    // !==========================================================

    @Post()
    @CustomApiOkResponse(DocsMapper.posts.POST.create)
    async create(@Body() createPostDto: CreatePostDto) {
        const queryRunner = this.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const data = await this.postsService.create(
                createPostDto,
                queryRunner,
            );

            this.logger.log(data);

            await queryRunner.commitTransaction();

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
        } catch (e) {
            this.logger.debug(e);

            await queryRunner.rollbackTransaction();
            return ResponseUtil.failure(RESPONSE_MESSAGE.INTERNAL_SERVER_ERROR);
        } finally {
            await queryRunner.release();
        }
    }

    @Get()
    @CustomApiOkResponse(DocsMapper.posts.GET.findAll)
    async findAll(@PageNumber('page') page: number) {
        try {
            const data = await this.postsService.findAll(page);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, data);
        } catch {
            return ResponseUtil.failure(RESPONSE_MESSAGE.NULL_VALUE);
        }
    }
}
