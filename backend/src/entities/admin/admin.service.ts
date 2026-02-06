import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async isAdmin(username: string): Promise<boolean> {
    const count = await this.adminRepository.count({
      relations: ['user'],
      where: {
        user: {
          username,
        },
      },
    });

    return count > 0;
  }
}
