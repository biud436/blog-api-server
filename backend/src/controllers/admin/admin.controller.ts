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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { AdminOnly, JwtGuard } from 'src/decorators/custom.decorator';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { DataSource } from 'typeorm';
import { AdminService } from './admin.service';
import { NewCategoryDto } from './dto/new-category.dto';

@Controller('admin')
@JwtGuard()
@AdminOnly()
@ApiBearerAuth()
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @Post('/category')
    @ApiOperation({
        summary: '카테고리 추가',
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
    @ApiOperation({
        summary: '카테고리 출력',
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

    @Get('/category/:categoryName')
    async getAncestors(@Param('categoryName') categoryName: string) {
        try {
            const res = await this.adminService.getAncestors(categoryName);
            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e) {
            return ResponseUtil.failureWrap(e);
        }
    }
}
