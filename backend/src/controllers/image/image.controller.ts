import {
    Controller,
    Get,
    Logger,
    ParseIntPipe,
    Post,
    Query,
    Render,
    Res,
    UploadedFiles,
    UseInterceptors,
    Header,
    UploadedFile,
    Param,
    Body,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiExcludeEndpoint } from '@nestjs/swagger';
import { InjectConnection, InjectDataSource } from '@nestjs/typeorm';
import { AdminOnly, JwtGuard } from 'src/decorators/custom.decorator';
import { Connection, DataSource } from 'typeorm';
import { ImageService } from './image.service';
import { Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as multerS3 from 'multer-s3';
import {
    MulterS3File,
    S3FileInterceptor,
} from '../../interceptors/s3.upload.interceptor';
import { UserInfo } from 'src/decorators/user.decorator';
import { JwtPayload } from '../auth/validator/response.dto';
import { ResponseUtil } from 'src/utils/ResponseUtil';
import { RESPONSE_MESSAGE } from 'src/utils/response';
import { IResponsableData } from 'src/utils/response.interface';
import { S3ImageUploadDto } from './dto/s3-image-upload.dto';
import { UserId } from 'src/decorators/x-api-key.decorator';

@Controller('image')
export class ImageController {
    private readonly logger = new Logger(ImageController.name);

    constructor(
        private readonly imageService: ImageService,
        private readonly httpService: HttpService,
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
    async getStatsSvg(
        @Query('text') text: string,
        @Query('username') username: string,
        @Query('color') color: string,
        @Query('textSize', ParseIntPipe) textSize = 60,
        @Query('y', ParseIntPipe) y = 50,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { data } = (await this.httpService.axiosRef.get(
            `https://api.github.com/users/${username}`,
        )) as Record<string, any>;

        const { login, name, public_repos, followers } = data;

        return `
        <svg
            id='visual'
            viewBox='0 0 900 300'
            width='900'
            height='300'
            xmlns='http://www.w3.org/2000/svg'
            xmlns:xlink='http://www.w3.org/1999/xlink'
            version='1.1'
            preserveAspectRatio="none"
        >
        <style>

            .ping-pong {
                animation: pong 1s ease-in-out infinite;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .smooth-text {
                font-size: 4.5em;
                font-weight: bold;
                font-family: 'Noto Sans KR', sans-serif;
                text-align: center;
                color: #0e0e0e;
                animation: smooth-text 1s ease-in-out infinite;
            }

            .smooth-text-reverse {
                font-size: 4.5em;
                font-weight: bold;
                font-family: 'Noto Sans KR', sans-serif;
                text-align: center;
                color: #0e0e0e;
                animation: smooth-text-reverse 1s ease-in-out infinite;
            }

            date-text {
                font-size: 1.5em;
            }

            @keyframes smooth-text {
                0% {
                    transform: translateX(0);
                }

                50% {
                    transform: translateX(10px);
                }

                100% {
                    transform: translateX(0);
                }
            }

            @keyframes smooth-text-reverse {
                0% {
                    transform: translateX(0);
                }

                50% {
                    transform: translateX(-10px);
                }

                100% {
                    transform: translateX(0);
                }
            }

            .ping-pong-2 {
                animation: pong-1 1s ease-in-out infinite;
                width: 100%;
                display: flex;
                justify-content: center;
                align-items: center;                
            }

            @keyframes pong {
                0% {
                    fill: #fff;
                    font-size: 1;
                    transform: translate(0, 0);
                }

                50% {
                    fill: #000;
                    font-size: 1.4em;
                    transform: translate(0, 2px);
                }

                100% {
                    fill: #fff;
                    font-size: 1;
                    transform: translate(0, 0);
                }
            }

            @keyframes pong-1 {
                0% {
                    fill: #fff;
                    font-size: 1;
                }

                50% {
                    fill: #000;
                    font-size: 1.2em;
                }

                100% {
                    fill: #fff;
                    font-size: 1;
                }
            }

            .colorize-bg {
                animation: colorize 1s ease-in-out infinite;
            }

            @keyframes colorize {
                0% {
                    fill: #fff;
                    text-shadow: 0 0 0 #fff;
                }

                100% {
                    fill: #efefef;
                    text-shadow: 0 0 0 #000;
                }
            }


        </style>
        
        <rect width="900" height="300" fill="gray" class="colorize-bg">
            <animate
            attributeName="rx"
            values="0;80;0"
            dur="10s"
            repeatCount="indefinite" />
        </rect>

        <text
            x="50%"
            y="30%"
            text-anchor="middle"
            font-size="4.5em"
            font-weight="bold"
            fill="#000"
            class="smooth-text"
        >${name ?? login}'s Profile</text>

        ${text
            .split('')
            .map((char, index) => {
                return `
            <text
                x="${10 + index * 20}"
                y="${y}"
                fill="#${color}"
                font-size="${textSize}"
                class="${index % 3 === 0 ? 'ping-pong' : 'ping-pong-2'}"
            >
                ${char}
            </text>
            `;
            })
            .join('')}  

        <text
            x="50%"
            y="80%"
            text-anchor="middle"
            font-size="3.5em"
            font-weight="bold"
            fill="#000"
            class="smooth-text-reverse"
        >${followers} Followers</text>

        <!-- Last Updated Text -->
        <text
            x="50%"
            y="90%"
            text-anchor="right"
            fill="#000"
            class="date-text"
        >Last Updated: ${new Date().toLocaleString()}</text>
    </svg>        
    `
            .replace('{{text}}', text)
            .replace('{{color}}', color)
            .replace('{{textSize}}', textSize.toString())
            .replace('{{y}}', y.toString())
            .replace('{{dy}}', (y + 50).toString());
    }
}
