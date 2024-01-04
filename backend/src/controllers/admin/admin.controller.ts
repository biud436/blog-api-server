import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Query,
    ParseBoolPipe,
    ParseIntPipe,
    HttpStatus,
    Req,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import {
    AdminOnly,
    ApiNotebook,
    JwtGuard,
} from 'src/common/decorators/swagger/api-notebook.decorator';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { DataSource } from 'typeorm';
import { AdminService } from './admin.service';
import { ChangeCategoryDto } from './dto/change-category.dto';
import { NewCategoryDto } from './dto/new-category.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('관리')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    /**
     * 카테고리 명을 변경합니다.
     *
     * @tag 관리
     * @param categoryId 카테고리 ID
     * @param updateCategoryNameDto 카테고리 정보
     * @returns
     */
    @Patch('/category/:categoryId')
    @AdminOnly()
    @JwtGuard()
    @ApiNotebook({
        operation: {
            summary: '카테고리 이름 변경',
        },
        params: [
            {
                name: 'categoryId',
                description: '카테고리 ID',
            },
        ],
        auth: true,
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
            throw ResponseUtil.failureWrap({
                name: 'UpdateCategoryNameError',
                message: '카테고리 이름 변경에 실패했습니다.',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }

    /**
     * 카테고리를 이동합니다.
     *
     * @tag 관리
     * @param prevCategoryId 이전 카테고리 ID
     * @param moveCategoryDto 이동할 카테고리 정보
     * @returns
     */
    @Post('/category/:prevCategoryId/move')
    @AdminOnly()
    @JwtGuard()
    @ApiNotebook({
        operation: {
            summary: '카테고리 이동',
            description: '카테고리를 이동합니다.',
        },
        params: [
            {
                name: 'prevCategoryId',
                description: '이전 카테고리 ID',
            },
        ],
        auth: true,
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

    /**
     * 부모 카테고리를 출력합니다.
     *
     * @tag 관리
     * @param categoryName 카테고리 명
     * @returns
     */
    @Get('/category/:categoryName')
    @ApiNotebook({
        operation: {
            summary: '부모 카테고리 출력',
            description: '부모 카테고리를 출력합니다.',
        },
        params: [
            {
                name: 'categoryName',
                description: '카테고리 명',
            },
        ],
        auth: true,
    })
    async getAncestors(@Param('categoryName') categoryName: string) {
        try {
            const res = await this.adminService.getAncestors(categoryName);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            throw ResponseUtil.failureWrap(e);
        }
    }

    /**
     * 새로운 카테고리를 추가합니다.
     *
     * @tag 관리
     * @param createCategoryDto 카테고리 DTO
     * @returns
     */
    @Post('/category')
    @AdminOnly()
    @JwtGuard()
    @ApiNotebook({
        operation: {
            summary: '새로운 카테고리 추가',
            description: '새로운 카테고리를 추가합니다.',
        },
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

    /**
     * 카테고리를 출력합니다.
     *
     * @tag 관리
     * @param req
     * @param isBeautify true면 트리를 JSON으로 보기 좋게 출력하고, false면 flat 모드로 출력합니다.
     * @returns
     */
    @Get('/category')
    @ApiNotebook({
        operation: {
            summary: '새로운 카테고리 추가',
            description: '새로운 카테고리를 추가합니다.',
        },
        queries: [
            {
                name: 'isBeautify',
                description:
                    'true면 트리를 JSON으로 보기 좋게 출력하고, false면 flat 모드로 출력합니다.',
            },
        ],
        auth: true,
    })
    async getDepthList(
        @Req() req: Request,
        @Query('isBeautify', ParseBoolPipe) isBeautify: boolean,
    ) {
        try {
            const res = await this.adminService.getTreeChildren(isBeautify);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            throw ResponseUtil.failureWrap(e);
        }
    }
}
