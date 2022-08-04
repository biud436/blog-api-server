import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { Admin } from './entities/admin.entity';
import { AdminRepository } from './entities/admin.repository';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
    ) {}

    async isAdmin(username: string): Promise<boolean> {
        return (
            (await this.adminRepository
                .createQueryBuilder('admin')
                .select()
                .leftJoin('admin.user', 'user')
                .where('user.username = :username', { username })
                .getCount()) > 0
        );
    }
}
