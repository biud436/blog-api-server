import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    ParseBoolPipe,
    ParseIntPipe,
    HttpStatus,
} from '@nestjs/common';
import { HttpErrorByCode } from '@nestjs/common/utils/http-error-by-code.util';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/decorators/custom.decorator';
import { UserId } from 'src/decorators/x-api-key.decorator';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { CreatePostTempDto } from 'src/entities/post-temp/dto/create-post-temp.dto';
import { UpdatePostTempDto } from 'src/entities/post-temp/dto/update-post-temp.dto';
import { RESPONSE_MESSAGE } from 'src/libs/response/response';
import {
    IResponsableData,
    IResponse,
} from 'src/libs/response/interface/response.interface';
import { ResponseUtil } from 'src/libs/response/ResponseUtil';
import { DataSource } from 'typeorm';
import { AdminService } from './admin.service';
import { ChangeCategoryDto } from './dto/change-category.dto';
import { NewCategoryDto } from './dto/new-category.dto';

@Controller('admin')
@ApiTags('관리자')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @Patch('/category/:categoryId')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        operation: {
            summary: '카테고리 이름 변경',
        },
        description: '카테고리 이름을 변경합니다.',
        auth: true,
    })
    @ApiParam({
        name: 'categoryId',
        description: '카테고리 ID',
    })
    async updateCategoryName(
        @Param('categoryId', ParseIntPipe) categoryId: number,
        @Body() updateCategoryNameDto: ChangeCategoryDto,
    ) {
        try {
            const res = await this.adminService.changeCategoryName(
                categoryId,
                updateCategoryNameDto, /////////////////////////////
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
        } catch (e: any) {
            return ResponseUtil.failureWrap({
                message: '카테고리 이름 변경에 실패했습니다.',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    @Post('/category/:prevCategoryId/move')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        operation: {
            summary: '카테고리 이동',
        },
        description: '카테고리를 이동합니다.',
        auth: true,
    })
    @ApiParam({
        name: 'prevCategoryId',
        description: '카테고리 ID',
    })
    async moveCategory(
        @Param('prevCategoryId', ParseIntPipe) prevCategoryId: number,
        @Body() moveCategoryDto: MoveCategoryDto,
    ) {
        moveCategoryDto = plainToClass(MoveCategoryDto, {
            ...moveCategoryDto,
            prevCategoryId,
        });

        // In this code, I've used the queryRunner to make a transaction.
        // so it may be received an error when rollback the atomic query.
        return this.adminService.moveCategory(moveCategoryDto);
    }

    @Get('/category/:categoryName')
    @CustomApiOkResponse({
        operation: {
            summary: '부모 카테고리 출력',
        },
        description: '부모 카테고리를 출력합니다.',
        auth: true,
    })
    @ApiParam({
        name: 'categoryName',
        description: '카테고리 이름',
    })
    async getAncestors(@Param('categoryName') categoryName: string) {
        try {
            const res = await this.adminService.getAncestors(categoryName);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    @Post('/category')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        operation: {
            summary: '새로운 카테고리 추가',
        },
        description: '새로운 카테고리를 추가합니다.',
        auth: true,
    })
    async createCategory(
        @Body()
        createCategoryDto: NewCategoryDto,
    ) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const res = await this.adminService.addCategory(
                queryRunner,
                createCategoryDto.categoryName,
                createCategoryDto.rootNodeName,
            );

            await queryRunner.commitTransaction();

            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e) {
            await queryRunner.rollbackTransaction();
            throw e;
        } finally {
            await queryRunner.release();
        }
    }

    @Get('/category')
    @CustomApiOkResponse({
        operation: {
            summary: '카테고리 출력',
        },
        description: '카테고리를 출력합니다.',
        auth: true,
    })
    @ApiQuery({
        name: 'isBeautify',
        description:
            'true면 트리를 JSON으로 보기 좋게 출력하고, false면 flat 모드로 출력합니다.',
    })
    async getDepthList(
        @Query('isBeautify', ParseBoolPipe) isBeautify: boolean,
    ) {
        try {
            const res = await this.adminService.getTreeChildren(isBeautify);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    @Post('/temp/post')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        operation: {
            summary: '임시 포스트를 저장합니다.',
        },
        description: '임시 포스트를 저장합니다.',
    })
    async saveTempPost(
        @UserId() userId: number,
        @Body() createPostTempDto: CreatePostTempDto,
    ) {
        try {
            const res = await this.adminService.saveTempPost(
                userId,
                createPostTempDto,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    @Patch('/temp/post/:postId')
    @AdminOnly()
    @JwtGuard()
    @CustomApiOkResponse({
        operation: {
            summary: '임시 포스트를 수정합니다.',
        },
        description: '임시 포스트를 수정합니다.',
    })
    @ApiParam({
        name: 'postId',
        description: '포스트 ID',
    })
    async updateTempPost(
        @UserId() userId: number,
        @Param('postId', ParseIntPipe) postId: number,
        @Body() updatePostTempDto: UpdatePostTempDto,
    ) {
        try {
            const res = await this.adminService.updateTempPost(
                userId,
                postId,
                updatePostTempDto,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.UPDATE_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }

    @Get('/temp/post')
    @CustomApiOkResponse({
        operation: {
            summary: '모든 임시 포스트를 조회합니다.',
        },
        description: '특정 유저에 대한 모든 임시 포스트를 조회합니다.',
        auth: true,
    })
    @AdminOnly()
    @JwtGuard()
    async getTempAllPost(@UserId() userId: number) {
        try {
            const res = await this.adminService.getTempPost(userId);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            return ResponseUtil.failureWrap({
                ...e,
            });
        }
    }

    @Delete('/temp/post/:postId')
    @ApiParam({
        name: 'postId',
        description: '포스트 ID',
    })
    @CustomApiOkResponse({
        operation: {
            summary: '임시 포스트 삭제',
        },
        description: '임시 포스트 삭제',
        auth: true,
    })
    @AdminOnly()
    @JwtGuard()
    async deleteTempPostById(
        @UserId() userId: number,
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        try {
            const res = await this.adminService.deleteTempPostById(
                userId,
                postId,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.DELETE_SUCCESS, res);
        } catch {
            return ResponseUtil.failure(RESPONSE_MESSAGE.NOT_FOUND_RESULT);
        }
    }

    @Get('/temp/post/:postId')
    @ApiParam({
        name: 'postId',
        description: '포스트 ID',
    })
    @CustomApiOkResponse({
        operation: {
            summary: '임시 포스트 조회',
        },
        description: '임시 포스트 조회',
        auth: true,
    })
    @AdminOnly()
    @JwtGuard()
    async getTempPostById(
        @UserId() userId: number,
        @Param('postId', ParseIntPipe) postId: number,
    ) {
        try {
            const res = await this.adminService.getTempPostById(userId, postId);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch {
            return ResponseUtil.failure(RESPONSE_MESSAGE.NOT_FOUND_RESULT);
        }
    }
}
