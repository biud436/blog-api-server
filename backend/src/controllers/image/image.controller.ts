import {
    Controller,
    Logger,
    Post,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiExcludeEndpoint } from '@nestjs/swagger';
import { InjectConnection, InjectDataSource } from '@nestjs/typeorm';
import { AdminOnly } from 'src/decorators/custom.decorator';
import { Connection, DataSource } from 'typeorm';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
    private readonly logger = new Logger(ImageController.name);

    constructor(
        private readonly imageService: ImageService,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @ApiExcludeEndpoint()
    @AdminOnly()
    @Post('/upload')
    @UseInterceptors(AnyFilesInterceptor())
    @ApiConsumes('multipart/form-data')
    async upload(@UploadedFiles() files: Express.Multer.File[]) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const file of files) {
                const result = await this.imageService.create(
                    file,
                    queryRunner,
                );
                if (result) {
                    this.logger.log(
                        `-- ${file.originalname} 이미지 업로드 완료 --`,
                    );
                }
            }
            await queryRunner.commitTransaction();
        } catch (e) {
            this.logger.error(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
