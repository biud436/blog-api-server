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

    @Get('/stats')
    @Render('svg-wave')
    async getStatsSvg(
        @Query('text') text: string,
        @Query('color') color: string,
        @Query('textSize', ParseIntPipe) textSize = 60,
        @Query('y', ParseIntPipe) y = 50,
    ) {
        return `
            <svg
            id='visual'
            viewBox='0 0 900 300'
            width='900'
            height='300'
            xmlns='http://www.w3.org/2000/svg'
            xmlns:xlink='http://www.w3.org/1999/xlink'
            version='1.1'
        >
            <rect x='0' y='0' width='900' height='300' fill='#002233'></rect>
            <text
                x='50'
                y='{{y}}'
                font-size='{{textSize}}'
                fill='#{{color}}'
            >{{text}}</text>
        
            <!-- smooth wave -->
            <path
                d='M0,150 C150,300 300,0 450,150 C600,300 750,0 900,150 L900,300 L0,300 Z'
                fill='#ffffff'
            ></path>
        </svg>        
        `
            .replace('{{text}}', text)
            .replace('{{color}}', color)
            .replace('{{textSize}}', textSize.toString())
            .replace('{{y}}', y.toString());
    }
}
