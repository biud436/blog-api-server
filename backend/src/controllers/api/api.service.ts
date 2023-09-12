import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    InjectQueryRunner,
    Transactional,
    TransactionalZone,
} from 'src/common/decorators/transactional';
import { DeletePostException } from 'src/common/exceptions/delete-post.exception';
import { NotFoundPostException } from 'src/common/exceptions/not-found-post.exception';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { PostService } from 'src/entities/post/post.service';
import { DataSource, QueryRunner } from 'typeorm';

@Injectable()
@TransactionalZone()
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
    async deletePost(
        postId: number,
        @InjectQueryRunner() queryRunner?: QueryRunner,
    ) {
        const result = await this.postsService.deletePostById(
            postId,
            queryRunner!,
        );

        if (result.affected === 0) {
            throw new DeletePostException();
        }

        return ResponseUtil.success(RESPONSE_MESSAGE.DELETE_SUCCESS, result);
    }
}
