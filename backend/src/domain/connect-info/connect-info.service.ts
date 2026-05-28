import { Injectable } from '@nestjs/common';
import { BaseRepository, DeleteResult } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import {
  Paginatable,
  PaginationConfig,
  PaginationResult,
} from '../../common/config/list-config';
import { CreateConnectInfoDto } from '../../entities/connect-info/dto/create-connect-info.dto';
import { ConnectInfo } from './connect-info.entity';

@Injectable()
export class ConnectInfoService {
  constructor(
    @InjectRepository(ConnectInfo)
    private readonly connectInfoRepository: BaseRepository<ConnectInfo>,
  ) {}

  protected isDevelopment(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  async create(
    createConnectInfoDto: CreateConnectInfoDto,
  ): Promise<ConnectInfo | void> {
    if (this.isDevelopment()) {
      return;
    }

    return await this.connectInfoRepository.save(createConnectInfoDto);
  }

  async findAll(pageNumber: number): Promise<Paginatable<ConnectInfo>> {
    const pageSize = PaginationConfig.limit.numberPerPage;
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    const result = await this.connectInfoRepository.findWithPage({
      page: safePage,
      pageSize,
      orderBy: { id: 'DESC' },
    });

    const maxPage = result.totalPages;
    const currentPage = result.page > maxPage && maxPage > 0 ? maxPage : result.page;
    const pagePerBlock = PaginationConfig.limit.pagePerBlock;
    const pagination: PaginationResult = {
      currentPage,
      totalCount: result.total,
      maxPage,
      currentBlock: Math.ceil(currentPage / pagePerBlock),
      maxBlock: Math.ceil(maxPage / pagePerBlock),
    };

    return {
      pagination,
      entities: result.data,
    };
  }

  async delete(id: number): Promise<DeleteResult> {
    return await this.connectInfoRepository.delete({ id });
  }
}
