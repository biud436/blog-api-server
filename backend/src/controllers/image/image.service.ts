import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/entities/user/user.service';
import { RedisService } from 'src/micro-services/redis/redis.service';
import { AES256Provider } from 'src/modules/aes/aes-256.provider';
import { CryptoUtil } from 'src/utils/CryptoUtil';
import { DateTimeUtil } from 'src/utils/DateTimeUtil';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { JwtPayload } from '../auth/validator/response.dto';
import { CreateImageDto } from './dto/create-image.dto';
import { Image } from './entities/image.entity';
import * as MulterS3 from 'multer-s3';

@Injectable()
export class ImageService {
    private readonly logger = new Logger(ImageService.name);

    constructor(
        @InjectRepository(Image)
        private readonly imageRepository: Repository<Image>,
        @InjectDataSource() private readonly dataSource: DataSource,
        private readonly userService: UserService,
        private readonly redisService: RedisService,
    ) {}

    async create(createImageDto: CreateImageDto, queryRunner?: QueryRunner) {
        const model = this.imageRepository.create(createImageDto);

        if (queryRunner) {
            return queryRunner.manager.save(model);
        }

        return this.imageRepository.save(model);
    }

    async getTempImageFileName(filename: string, username: string) {
        const filename2 = await this.userService.findProfileByUsername(
            username,
        );

        if (!filename2) {
            throw new Error('해당 유저는 존재하지 않습니다.');
        }

        const hashFile = CryptoUtil.uuid().replace(/-/gi, '');
        const tempFileName = CryptoUtil.sha512(username + hashFile);

        return tempFileName;
    }

    async upload(user: JwtPayload, files: Express.MulterS3.File[]) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const file = files[0];

        const key = file.key.split('.')[0];

        const dto = <CreateImageDto>{
            filename: key,
            originalname: file.originalname,
            destination: file.location,
            size: file.size,
            mimetype: file.mimetype,
            encoding: file['encoding'],
            fieldname: file.fieldname,
            path: file.location,
        };

        try {
            const result = await this.create(dto, queryRunner);
            if (result) {
                this.logger.log(
                    `-- ${file.originalname} 이미지 업로드 완료 --`,
                );
            }
            await queryRunner.commitTransaction();

            return file;
        } catch (e) {
            this.logger.error(e);
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }
}
