import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ApiKey } from './entities/api-key.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';
import { Role } from 'src/common/decorators/roles/role.enum';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { LocalDateTime } from '@js-joda/core';
import { ScopeRoles } from 'src/common/decorators/api/x-api-scope.decorator';
import { GrantRoleDto } from './dto/grant-role.dto';

const EXPIRES_D_DAY = 30;

@Injectable()
export class ApiKeyService {
    constructor(
        @InjectRepository(ApiKey)
        private readonly apiKeyRepository: Repository<ApiKey>,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_4AM)
    async handleExpiredDate() {
        const qb = this.apiKeyRepository
            .createQueryBuilder('apiKey')
            .update()
            .set({
                isExpired: true,
            })
            .where('expiresAt < NOW()');

        await qb.execute();
    }

    async create(createApiKeyDto: CreateApiKeyDto): Promise<ApiKey> {
        const model = this.apiKeyRepository.create(createApiKeyDto);

        return this.apiKeyRepository.save(model);
    }

    async getUserId(apiKey: string): Promise<number> {
        const model = await this.apiKeyRepository.findOneOrFail({
            where: {
                accessKey: apiKey,
            },
        });

        const { userId } = model;

        return userId;
    }

    async findOneByApiKey(apiKey: string): Promise<ApiKey> {
        try {
            const model = await this.apiKeyRepository
                .createQueryBuilder('apiKey')
                .select()
                .leftJoinAndSelect('apiKey.user', 'user')
                .leftJoinAndSelect('user.profile', 'profile')
                .where('apiKey.accessKey = :accessKey', { accessKey: apiKey })
                .andWhere('apiKey.isExpired = :isExpired', { isExpired: false })
                .orderBy('apiKey.id', 'DESC')
                .getOneOrFail();

            return model;
        } catch {
            throw new UnauthorizedException('API key is invalid or expired');
        }
    }

    async findOneById(queryRunner: QueryRunner, id: number) {
        const model = await this.apiKeyRepository
            .createQueryBuilder('apiKey', queryRunner)
            .select()
            .leftJoinAndSelect('apiKey.user', 'user')
            .leftJoinAndSelect('user.profile', 'profile')
            .where('apiKey.id = :id', { id })
            .andWhere('apiKey.isExpired = :isExpired', { isExpired: false })
            .orderBy('apiKey.id', 'DESC')
            .useTransaction(true)
            .setQueryRunner(queryRunner)
            .getOneOrFail();

        return model;
    }

    async issueApiKey(id: number): Promise<ApiKey> {
        const item = await this.apiKeyRepository.findOneOrFail({
            where: {
                id,
            },
        });

        const targetDay = DateTimeUtil.addDay(new Date(), EXPIRES_D_DAY);
        if (!targetDay) {
            throw new BadRequestException('유효기간이 잘못되었습니다.');
        }

        const expiresAt = DateTimeUtil.toDate(targetDay);
        if (!expiresAt) {
            throw new BadRequestException('유효기간이 잘못되었습니다.');
        }

        item.expiresAt = expiresAt;

        item.isExpired = false;

        const newUID = CryptoUtil.createUUIDV4().replace(/-/g, '');
        item.accessKey = newUID;

        return await this.apiKeyRepository.save(item);
    }

    async updateApiKey(
        id: number,
        updateApiKeyDto: UpdateApiKeyDto,
        currentRole: Role,
    ): Promise<ApiKey> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const { accessKey, expiresAt, scope } = updateApiKeyDto;

            const apiKeyModel = await this.apiKeyRepository
                .createQueryBuilder('apiKey', queryRunner)
                .select()
                .where('apiKey.id = :id', { id })
                .useTransaction(true)
                .getOneOrFail();

            if (currentRole !== Role.Admin) {
                throw new UnauthorizedException(
                    '권한이 없습니다. 관리자에게 문의하세요.',
                );
            }

            if (!scope) {
                throw new BadRequestException('scope가 잘못되었습니다.');
            }

            apiKeyModel.scope = scope;

            if (!accessKey || !CryptoUtil.isUUIDv4(accessKey)) {
                throw new BadRequestException(
                    'API 키 형식이 유효하지 않습니다.',
                );
            }

            const qb = this.apiKeyRepository
                .createQueryBuilder('apiKey', queryRunner)
                .update();

            let data: QueryDeepPartialEntity<ApiKey> = {
                scope: apiKeyModel.scope,
            };

            // API 키 만료일을 재갱신합니다.
            if (apiKeyModel.accessKey !== accessKey) {
                apiKeyModel.accessKey = accessKey;

                data = {
                    ...data,
                    accessKey: accessKey,
                };
            }

            // 만료일이 설정되었을 때에만 변경합니다.
            if (expiresAt) {
                apiKeyModel.expiresAt = expiresAt;
                data = {
                    ...data,
                    expiresAt: expiresAt,
                };
            }

            // 만료 여부 감지
            const expiryDateLocalDateTime = LocalDateTime.of(
                apiKeyModel.expiresAt.getFullYear(),
                apiKeyModel.expiresAt.getMonth() + 1,
                apiKeyModel.expiresAt.getDate(),
                apiKeyModel.expiresAt.getHours(),
                apiKeyModel.expiresAt.getMinutes(),
                apiKeyModel.expiresAt.getSeconds(),
            );

            DateTimeUtil.now().isAfter(expiryDateLocalDateTime)
                ? (apiKeyModel.isExpired = true)
                : (apiKeyModel.isExpired = false);

            data = {
                ...data,
                isExpired: apiKeyModel.isExpired,
            };

            // UPDATE 쿼리 실행
            await qb
                .set(data)
                .where('id = :id', { id })
                .setQueryRunner(queryRunner)
                .useTransaction(true)
                .execute();

            const updateResult = await this.findOneById(queryRunner, id);

            await queryRunner.commitTransaction();

            return updateResult;
        } catch (e: any) {
            await queryRunner.rollbackTransaction();

            throw new BadRequestException('API 키 수정에 실패하였습니다.');
        } finally {
            await queryRunner.release();
        }
    }

    private collectRoles(grantedRole: ScopeRoles[]) {
        let resultScope = '';

        const roles = [];

        for (const role of grantedRole) {
            roles.push(role);
        }

        resultScope = roles.join(':');

        return resultScope;
    }

    async grantRole({ apiKey, roles }: GrantRoleDto) {
        const updateResult = await this.apiKeyRepository
            .createQueryBuilder('apikey')
            .update()
            .set({ scope: this.collectRoles(roles) })
            .where('apiKey = :apiKey', { apiKey: apiKey })
            .execute();

        return updateResult;
    }
}
