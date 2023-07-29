import { HttpStatus, Injectable } from '@nestjs/common';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { PostService } from 'src/entities/post/post.service';

@Injectable()
export class ApiService {
    constructor(private readonly postsService: PostService) {}

    async isAdmin() {
        return {
            isAdmin: true,
        };
    }

    async getPost(pageNumber: number, pageSize: number) {
        try {
            const categoryId = undefined;
            const res = await this.postsService.findAll(
                pageNumber,
                categoryId,
                pageSize,
            );

            return ResponseUtil.success(RESPONSE_MESSAGE.READ_SUCCESS, res);
        } catch (e: any) {
            throw ResponseUtil.failureWrap({
                name: 'GetPostError',
                message: '포스트를 불러오는데 실패했습니다.',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        }
    }
}
