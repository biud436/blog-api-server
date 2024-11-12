import { Injectable } from '@nestjs/common';
import { DeletePostException } from 'src/common/exceptions/delete-post.exception';
import { NotFoundPostException } from 'src/common/exceptions/not-found-post.exception';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { PostService } from 'src/entities/post/post.service';
import { Transactional } from 'typeorm-transactional';

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
            throw new NotFoundPostException();
        }
    }

    @Transactional()
    async deletePost(postId: number) {
        const result = await this.postsService.deletePostById(postId);

        if (result.affected === 0) {
            throw new DeletePostException();
        }

        return ResponseUtil.success(RESPONSE_MESSAGE.DELETE_SUCCESS, result);
    }
}
