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
    Req,
    BadRequestException,
} from '@nestjs/common';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { CreatePostTempDto } from 'src/entities/post-temp/dto/create-post-temp.dto';
import { UpdatePostTempDto } from 'src/entities/post-temp/dto/update-post-temp.dto';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { DataSource } from 'typeorm';
import { AdminService } from './admin.service';
import { ChangeCategoryDto } from './dto/change-category.dto';
import { NewCategoryDto } from './dto/new-category.dto';
import { Request } from 'express';

@Controller('admin')
@ApiTags('관리자')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    /**
     * 카테고리 명을 변경합니다.
     *
     * @param categoryId 카테고리 ID
     * @param updateCategoryNameDto 카테고리 정보
     * @returns
     */
    @Patch('/category/:categoryId')
    @AdminOnly()
    @JwtGuard()
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
            throw ResponseUtil.failureWrap({
                message: '카테고리 이름 변경에 실패했습니다.',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    /**
     * 카테고리를 이동합니다.
     *
     * @param prevCategoryId  이전 카테고리 ID
     * @param moveCategoryDto  이동할 카테고리 정보
     * @returns
     */
    @Post('/category/:prevCategoryId/move')
    @AdminOnly()
    @JwtGuard()
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

    /**
     * 부모 카테고리를 출력합니다.
     *
     * @param categoryName 카테고리 명
     * @returns
     */
    @Get('/category/:categoryName')
    async getAncestors(@Param('categoryName') categoryName: string) {
        try {
            const res = await this.adminService.getAncestors(categoryName);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            throw ResponseUtil.failureWrap(e);
        }
    }

    /**
     * 새로운 카테고리를 추가합니다.
     *
     * @param createCategoryDto 카테고리 DTO
     * @returns
     */
    @Post('/category')
    @AdminOnly()
    @JwtGuard()
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

    /**
     * 카테고리를 출력합니다.
     *
     * @param req
     * @param isBeautify true면 트리를 JSON으로 보기 좋게 출력하고, false면 flat 모드로 출력합니다.
     * @returns
     */
    @Get('/category')
    async getDepthList(
        @Req() req: Request,
        @Query('isBeautify', ParseBoolPipe) isBeautify: boolean,
    ) {
        try {
            const res = await this.adminService.getTreeChildren(isBeautify);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            throw ResponseUtil.failureWrap(e);
        }
    }

    /**
     * 임시 포스트를 저장합니다.
     * @param userId 유저 ID
     * @param createPostTempDto 임시 포스트 정보
     * @returns
     */
    @Post('/temp/post')
    @AdminOnly()
    @JwtGuard()
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

    /**
     * 임시 포스트를 수정합니다.
     *
     * @param userId 유저 ID
     * @param postId 포스트 번호
     * @param updatePostTempDto 임시 포스트 정보
     * @returns
     */
    @Patch('/temp/post/:postId')
    @AdminOnly()
    @JwtGuard()
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

    /**
     * 특정 유저에 대한 모든 임시 포스트를 조회합니다.
     *
     * @param userId 유저 ID
     * @returns
     */
    @Get('/temp/post')
    @AdminOnly()
    @JwtGuard()
    async getTempAllPost(@UserId() userId: number) {
        try {
            const res = await this.adminService.getTempPost(userId);

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            throw ResponseUtil.FAILED_TEMP_POST;
        }
    }

    /**
     * 임시 포스트 삭제
     *
     * @param userId 유저 ID
     * @param postId 포스트 번호
     * @returns
     */
    @Delete('/temp/post/:postId')
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
            throw ResponseUtil.failure(RESPONSE_MESSAGE.NOT_FOUND_RESULT);
        }
    }

    /**
     * 임시 포스트 조회
     *
     * @param userId 유저 ID
     * @param postId 포스트 번호
     * @returns
     */
    @Get('/temp/post/:postId')
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
            throw ResponseUtil.failure(RESPONSE_MESSAGE.NOT_FOUND_RESULT);
        }
    }
}
