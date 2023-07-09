import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
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
