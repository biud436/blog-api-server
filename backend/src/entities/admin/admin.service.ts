import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AdminService implements OnModuleInit {
    constructor(
        @InjectRepository(Admin)
        private readonly adminRepository: Repository<Admin>,
        @InjectDataSource() private readonly dataSource: DataSource,
    ) {}

    async onModuleInit() {
        // MysqlDriver < Driver
        const pool = (this.dataSource.driver as any).pool;
        if ('_allConnections' in pool) {
            const currentConnections = pool._allConnections;
            console.log('연결 수: ', currentConnections.length);
        }

        console.log('최대 커넥션 갯수:', pool.config.connectionLimit);

        // https://github.com/mysqljs/mysql/issues/1771
        // pool?.on('connection', (connection: unknown) => {
        //     console.log(connection);
        //     if ('_allConnections' in pool) {
        //         const currentConnections = pool._allConnections;

        //         console.log('연결 수: ', currentConnections.length);
        //     }
        // });
    }

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
