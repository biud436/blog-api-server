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
    Req,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import {
    AdminOnly,
    ApiNotebook,
    JwtGuard,
} from 'src/common/decorators/swagger/api-notebook.decorator';
import { MoveCategoryDto } from 'src/entities/category/dto/move-category.dto';
import { AdminService } from './admin.service';
import { ChangeCategoryDto } from './dto/change-category.dto';
import { NewCategoryDto } from './dto/new-category.dto';
import { Request } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('관리')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

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
        return await this.adminService.changeCategoryName(
            categoryId,
            updateCategoryNameDto,
        );
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
        // Composite DTO
        moveCategoryDto = plainToClass(MoveCategoryDto, {
            ...moveCategoryDto,
            prevCategoryId,
        });

        return await this.adminService.moveCategory(moveCategoryDto);
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
        return await this.adminService.getAncestors(categoryName);
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
            description: '새로운 카테고리를 추가합니다.',
        },
        auth: true,
    })
    async createCategory(
        @Body()
        createCategoryDto: NewCategoryDto,
    ) {
        return await this.adminService.addCategory(
            createCategoryDto.categoryName,
            createCategoryDto.rootNodeName,
        );
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
        return await this.adminService.getTreeChildren(isBeautify);
    }
}
