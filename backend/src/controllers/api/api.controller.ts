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
    ApiNotebook,
    JwtGuard,
} from 'src/common/decorators/swagger/api-notebook.decorator';
import { UploadFolder } from 'src/common/decorators/enhancer/upload-folder';
import { ApiService } from './api.service';
import { PageNumber } from 'src/common/decorators/pagination/page-number.decorator';
import { PageSize } from 'src/common/decorators/pagination/page-size.decorator';

@Controller('api')
@ApiTags('API')
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
    @ApiNotebook({
        operation: {
            summary: '관리자 권한 확인',
            description: '관리자 권한을 확인합니다.',
        },
        auth: true,
    })
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
    @ApiNotebook({
        operation: {
            summary: '게시글 삭제',
            description: '게시글을 삭제합니다.',
        },
        params: [
            {
                name: 'postId',
                description: '포스트 아이디',
            },
        ],
        auth: true,
    })
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
    @ApiNotebook({
        operation: {
            summary: '포스트 목록',
            description: '포스트 목록을 가져옵니다.',
        },
        queries: [
            {
                name: 'pageNumber',
                description: '페이지 번호',
            },
            {
                name: 'pageSize',
                description: '페이지 사이즈',
            },
        ],
        auth: true,
    })
    async getPost(
        @PageNumber() pageNumber: number,
        @PageSize() pageSize: number,
    ) {
        return await this.apiService.getPost(pageNumber, pageSize);
    }
}
