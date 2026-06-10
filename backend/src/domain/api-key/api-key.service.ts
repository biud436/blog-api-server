import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LocalDateTime } from '@js-joda/core';
import { BaseRepository, Transactional, qAlias, sql } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { CryptoUtil } from 'src/common/libs/crypto/CryptoUtil';
import { DateTimeUtil } from 'src/common/libs/date/DateTimeUtil';
import { Role } from 'src/common/decorators/authorization/role.enum';
import { ScopeRoles } from 'src/common/decorators/api/x-api-scope.decorator';
import { CreateApiKeyDto } from '../../entities/api-key/dto/create-api-key.dto';
import { UpdateApiKeyDto } from '../../entities/api-key/dto/update-api-key.dto';
import { GrantRoleDto } from '../../entities/api-key/dto/grant-role.dto';
import { ApiKey } from './api-key.entity';

const EXPIRES_D_DAY = 30;

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepository: BaseRepository<ApiKey>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleExpiredDate(): Promise<void> {
    await this.apiKeyRepository.updateMany(
      { isExpired: true },
      { where: { expiresAt: { lt: sql`NOW()` } as never } },
    );
  }

  async create(createApiKeyDto: CreateApiKeyDto): Promise<ApiKey> {
    const partial = createApiKeyDto as unknown as Partial<ApiKey>;
    return await this.apiKeyRepository.save({
      ...partial,
      // stingerloom save 는 미지정 컬럼을 NULL 로 INSERT 하므로 기본값 명시
      scope: partial.scope ?? 'read:write:update:delete',
    });
  }

  async getUserId(apiKey: string): Promise<number> {
    const model = await this.apiKeyRepository.findOneOrFail({
      where: { accessKey: apiKey },
    });

    return model.userId;
  }

  async findOneByApiKey(apiKey: string): Promise<ApiKey> {
    const key = qAlias(ApiKey, 'apiKey');

    try {
      const found = await this.apiKeyRepository
        .createQueryBuilder('apiKey')
        .where(key.accessKey.eq(apiKey))
        .andWhere(key.isExpired.eq(false))
        .orderBy({ id: 'DESC' })
        .getOneOrFail();

      // 관계 하이드레이션은 find(relations) 2단계 — QB 의 joinAndSelect 는
      // 중복 컬럼명이 루트 엔티티를 덮어쓰는 업스트림 이슈가 있다.
      return await this.apiKeyRepository.findOneOrFail({
        where: { id: found.id },
        relations: ['user', 'user.profile'],
      });
    } catch {
      throw new UnauthorizedException('API key is invalid or expired');
    }
  }

  async findOneById(id: number): Promise<ApiKey> {
    const key = qAlias(ApiKey, 'apiKey');

    const found = await this.apiKeyRepository
      .createQueryBuilder('apiKey')
      .where(key.id.eq(id))
      .andWhere(key.isExpired.eq(false))
      .orderBy({ id: 'DESC' })
      .getOneOrFail();

    return await this.apiKeyRepository.findOneOrFail({
      where: { id: found.id },
      relations: ['user', 'user.profile'],
    });
  }

  async issueApiKey(id: number): Promise<ApiKey> {
    const item = await this.apiKeyRepository.findOneOrFail({ where: { id } });

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
    item.accessKey = CryptoUtil.createUUIDV4().replace(/-/g, '');

    return await this.apiKeyRepository.save(item);
  }

  @Transactional()
  async updateApiKey(
    id: number,
    updateApiKeyDto: UpdateApiKeyDto,
    currentRole: Role,
  ): Promise<ApiKey> {
    try {
      const { accessKey, expiresAt, scope } = updateApiKeyDto;

      const apiKeyModel = await this.apiKeyRepository.findOneOrFail({
        where: { id },
      });

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
        throw new BadRequestException('API 키 형식이 유효하지 않습니다.');
      }

      const patch: Partial<ApiKey> = { scope: apiKeyModel.scope };

      if (apiKeyModel.accessKey !== accessKey) {
        apiKeyModel.accessKey = accessKey;
        patch.accessKey = accessKey;
      }

      if (expiresAt) {
        apiKeyModel.expiresAt = expiresAt;
        patch.expiresAt = expiresAt;
      }

      const expiryDateLocalDateTime = LocalDateTime.of(
        apiKeyModel.expiresAt.getFullYear(),
        apiKeyModel.expiresAt.getMonth() + 1,
        apiKeyModel.expiresAt.getDate(),
        apiKeyModel.expiresAt.getHours(),
        apiKeyModel.expiresAt.getMinutes(),
        apiKeyModel.expiresAt.getSeconds(),
      );

      apiKeyModel.isExpired = DateTimeUtil.now().isAfter(
        expiryDateLocalDateTime,
      );
      patch.isExpired = apiKeyModel.isExpired;

      await this.apiKeyRepository.updateMany(patch, { where: { id } });

      return await this.findOneById(id);
    } catch {
      throw new BadRequestException('API 키 수정에 실패하였습니다.');
    }
  }

  private collectRoles(grantedRole: ScopeRoles[]): string {
    return grantedRole.join(':');
  }

  async grantRole({
    apiKey,
    roles,
  }: GrantRoleDto): Promise<{ affected: number }> {
    return await this.apiKeyRepository.updateMany(
      { scope: this.collectRoles(roles) },
      { where: { accessKey: apiKey } },
    );
  }
}
