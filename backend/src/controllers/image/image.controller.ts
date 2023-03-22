import {
    Controller,
    Get,
    Logger,
    ParseIntPipe,
    Post,
    Query,
    Render,
    UploadedFiles,
    UseInterceptors,
    Header,
    Body,
    DefaultValuePipe,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    AdminOnly,
    CustomApiOkResponse,
    JwtGuard,
} from 'src/common/decorators/custom.decorator';
import { DataSource } from 'typeorm';
import { ImageService } from './image.service';
import {
    MulterS3File,
    S3FileInterceptor,
} from '../../common/interceptors/s3.upload.interceptor';
import { ResponseUtil } from 'src/common/libs/response/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/common/libs/response/response';
import { IResponsableData } from 'src/common/libs/response/interface/response.interface';
import { S3ImageUploadDto } from './dto/s3-image-upload.dto';
import { UserId } from 'src/common/decorators/user-id.decorator';
import { ImageCreateSvgCommand } from './commands/image-create-svg.command';
import { Image } from './entities/image.entity';

@Controller('image')
@ApiTags('이미지')
export class ImageController {
    private readonly logger = new Logger(ImageController.name);

    constructor(
        private readonly imageService: ImageService,
        private readonly createSvgCommand: ImageCreateSvgCommand,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @ApiExcludeEndpoint()
    @AdminOnly()
    @Post('/upload')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiConsumes('multipart/form-data')
    async upload(@UploadedFiles() files: any[]) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const pendingList: Promise<Image>[] = [];

            for (const file of files) {
                const result = this.imageService.create(file, queryRunner);
                pendingList.push(result);
            }

            await Promise.allSettled(pendingList);

            await queryRunner.commitTransaction();
        } catch (e) {
            this.logger.error(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 커스텀으로 만든 AWS S3 파일 인터셉터를 이용하여 이미지 파일을 업로드합니다.
     *
     * @param user
     * @param files
     * @param postId
     * @returns
     */
    @JwtGuard()
    @AdminOnly()
    @Post('/s3/upload')
    @ApiConsumes('multipart/form-data')
    @CustomApiOkResponse({
        operation: {
            summary: 'AWS S3 이미지 업로드',
        },
        description: 'AWS S3에 이미지를 업로드합니다.',
        auth: true,
    })
    @UseInterceptors(S3FileInterceptor('files')) // Custom Interceptor
    async uploadImageUsingS3(
        @UserId() userId: number,
        @UploadedFiles() files: MulterS3File[],
        @Body() data: S3ImageUploadDto,
    ): Promise<IResponsableData | ResponseUtil.FailureResponse> {
        try {
            const res = await this.imageService.upload(userId, files, data);

            return ResponseUtil.success(RESPONSE_MESSAGE.SAVE_SUCCESS, res);
        } catch (e: any) {
            return ResponseUtil.failure(e.message);
        }
    }

    /**
     * 깃허브 프로필용 이미지를 생성합니다.
     *
     * @param text
     * @param username
     * @param color
     * @param textSize
     * @param y
     * @param res
     * @returns
     */
    @Get(['/stats', '/shake-profile'])
    @Header('Content-Type', 'image/svg+xml')
    @Header('Cache-Control', 'public, max-age=3600')
    @Header('Access-Control-Allow-Origin', '*')
    @CustomApiOkResponse({
        operation: {
            summary: '깃허브 프로필 이미지 동적 생성',
        },
        description: '깃허브 프로필용 이미지를 생성합니다.',
    })
    @Render('svg-profile')
    async getStatsSvg(
        @Query('text') text: string,
        @Query('username') username: string,
        @Query('color') color: string,
        @Query('textSize', new DefaultValuePipe(60), ParseIntPipe)
        textSize = 60,
        @Query('y', new DefaultValuePipe(50), ParseIntPipe) y = 50,
    ) {
        return await this.createSvgCommand.execute(
            text,
            username,
            color,
            textSize,
            y,
        );
    }
}
