import { Injectable } from '@nestjs/common';
import { BaseRepository, qAlias } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { User } from '../user/user.entity';
import { Admin } from './admin.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: BaseRepository<Admin>,
  ) {}

  async isAdmin(username: string): Promise<boolean> {
    const admin = qAlias(Admin, 'admin');
    const user = qAlias(User, 'user');

    const count = await this.adminRepository
      .createQueryBuilder('admin')
      .innerJoin(User, 'user', (j) =>
        j.on(admin.col('userId'), '=', user.col('id')),
      )
      .where(user.username.eq(username))
      .getCount();

    return count > 0;
  }
}
