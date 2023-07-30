import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { PostService } from 'src/entities/post/post.service';
import { DataSource } from 'typeorm';

@Injectable()
export class ApiService {
    private readonly logger = new Logger(ApiService.name);

    constructor(
        private readonly postsService: PostService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

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

    async deletePost(postId: number) {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const result = await this.postsService.deletePostById(
                postId,
                queryRunner,
            );

            if (result.affected === 0) {
                throw ResponseUtil.failureWrap({
                    name: 'DeletePostError',
                    message: '포스트를 삭제하는데 실패했습니다.',
                    statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                });
            }

            await queryRunner.commitTransaction();

            return ResponseUtil.success(
                RESPONSE_MESSAGE.DELETE_SUCCESS,
                result,
            );
        } catch (e: any) {
            this.logger.error(e);
            await queryRunner.rollbackTransaction();

            throw ResponseUtil.failureWrap({
                name: 'DeletePostError',
                message: '포스트를 삭제하는데 실패했습니다.',
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            });
        } finally {
            await queryRunner.release();
        }
    }
}
