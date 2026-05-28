import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@stingerloom/orm';
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
    const count = await this.adminRepository
      .createQueryBuilder('admin')
      .innerJoin(User, 'user', (j) =>
        j.on('admin.user_id', '=', 'user.id'),
      )
      .where('user.username', username)
      .getCount();

    return count > 0;
  }
}
