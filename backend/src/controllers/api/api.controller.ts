import {
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { UploadFolder } from 'src/common/decorators/upload-folder';
import { ApiService } from './api.service';
import { PageNumber } from 'src/common/decorators/page-number.decorator';
import { PageSize } from 'src/common/decorators/page-size.decorator';

@Controller('api')
export class ApiController {
    constructor(private readonly apiService: ApiService) {}

    /**
     * 관리자 권한을 확인합니다.
     *
     * @tag API
     * @returns
     */
    @Get('/check/admin')
    @JwtGuard()
    @AdminOnly()
    async checkAdmin() {
        return await this.apiService.isAdmin();
    }

    /**
     * Delete post by post id in the admin page.
     * @tag API
     * @param postId
     * @returns
     */
    @Delete('/post/:postId')
    @JwtGuard()
    @AdminOnly()
    async deletePost(@Param('postId', ParseIntPipe) postId: number) {
        return await this.apiService.deletePost(postId);
    }

    /**
     * Gets post list in the admin page.
     *
     * @tag API
     * @param pageNumber
     * @param pageSize
     * @returns
     */
    @Get('/post')
    @JwtGuard()
    @AdminOnly()
    async getPost(
        @PageNumber('pageNumber') pageNumber: number,
        @PageSize() pageSize: number,
    ) {
        return await this.apiService.getPost(pageNumber, pageSize);
    }
}
