import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Paginatable, Pagination } from 'src/common/list-config';
import { DeleteResult, Repository } from 'typeorm';
import { CreateConnectInfoDto } from './dto/create-connect-info.dto';
import { UpdateConnectInfoDto } from './dto/update-connect-info.dto';
import { ConnectInfo } from './entities/connect-info.entity';

@Injectable()
export class ConnectInfoService {
    constructor(
        @InjectRepository(ConnectInfo)
        private connectInfoRepository: Repository<ConnectInfo>,
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

        const item = this.connectInfoRepository.create(createConnectInfoDto);

        return await this.connectInfoRepository.save(item);
    }

    /**
     * 연결 정보를 페이지네이션하여 반환한다.
     *
     * @param pageNumber
     * @returns
     */
    async findAll(pageNumber: number): Promise<Paginatable<ConnectInfo>> {
        const qb = this.connectInfoRepository
            .createQueryBuilder('connectInfo')
            .select()
            .setPagination(pageNumber)
            .orderBy('connectInfo.id', 'DESC');

        return await qb.getManyWithPagination(pageNumber);
    }

    async delete(id: number): Promise<DeleteResult> {
        return await this.connectInfoRepository.delete(id);
    }
}
