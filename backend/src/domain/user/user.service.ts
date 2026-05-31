import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BaseRepository, qAlias } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import {
  Paginatable,
  PaginationConfig,
  PaginationResult,
} from '../../common/config/list-config';
import { CreateUserDto } from '../../entities/user/dto/create-user.dto';
import { Profile } from '../profile/profile.entity';
import { User } from './user.entity';

export type UserLoginValidationInfo = {
  isValidUser: boolean;
  isCorrectPassword: boolean;
  userInfo?: User;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: BaseRepository<User>,
  ) {}

  /**
   * 기존 TypeORM 엔티티는 `@BeforeInsert savePassword()` 로 해싱했으나,
   * stingerloom 도메인 엔티티에는 라이프사이클 훅이 없으므로 여기서 해싱한다.
   * 호출 측이 `@Transactional()` 컨텍스트면 이 save 는 같은 tx 에 자동 합류한다.
   */
  async create(createUserDto: CreateUserDto, profile: Profile): Promise<User> {
    const password = await bcrypt.hash(createUserDto.password, 10);

    return await this.userRepository.save({
      username: createUserDto.username,
      password,
      profileId: profile.id,
    } as Partial<User>);
  }

  async validateUser(
    username: string,
    password_: string,
  ): Promise<UserLoginValidationInfo> {
    const user = await this.userRepository.findOne({
      where: { username, isValid: true },
    });

    if (!user) {
      return { isValidUser: false, isCorrectPassword: false };
    }

    return {
      isValidUser: true,
      isCorrectPassword: bcrypt.compareSync(password_, user.password),
      userInfo: user,
    };
  }

  async findProfileByUsername(username: string): Promise<User | null> {
    const user = qAlias(User, 'user');

    return await this.userRepository
      .createQueryBuilder('user')
      .innerJoinRelationAndSelect('user.profile', 'profile')
      .where(user.username.eq(username))
      .andWhere(user.isValid.eq(true))
      .whereHas('admins')
      .getOne();
  }

  async getUserId(username: string): Promise<User> {
    const user = qAlias(User, 'user');

    return await this.userRepository
      .createQueryBuilder('user')
      .where(user.username.eq(username))
      .andWhere(user.isValid.eq(true))
      .whereHas('admins')
      .getOneOrFail();
  }

  async getUserIdWithoutFail(username: string): Promise<User | null> {
    const user = qAlias(User, 'user');

    return await this.userRepository
      .createQueryBuilder('user')
      .where(user.username.eq(username))
      .whereHas('admins')
      .getOne();
  }

  async getUserList(pageNumber: number): Promise<Paginatable<User>> {
    const user = qAlias(User, 'user');
    const pageSize = PaginationConfig.limit.numberPerPage;
    const safePage = !pageNumber || pageNumber < 1 ? 1 : pageNumber;

    // 1) 관리자 유저 페이지의 id 와 전체 개수만 가볍게 조회.
    const [rows, total] = await this.userRepository
      .createQueryBuilder('user')
      .where(user.isValid.eq(true))
      .whereHas('admins')
      .orderBy({ id: 'DESC' })
      .limit(pageSize)
      .offset((safePage - 1) * pageSize)
      .getManyAndCount();

    // 2) profile / admins 관계까지 하이드레이션 (QB 는 OneToMany 를 중첩 로드하지 않음).
    const ids = rows.map((row) => row.id);
    const entities = ids.length
      ? await this.userRepository.find({
          where: { id: { in: ids } },
          relations: ['profile', 'admins'],
          orderBy: { id: 'DESC' },
        })
      : [];

    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = safePage > maxPage ? maxPage : safePage;
    const pagePerBlock = PaginationConfig.limit.pagePerBlock;
    const pagination: PaginationResult = {
      currentPage,
      totalCount: total,
      maxPage,
      currentBlock: Math.ceil(currentPage / pagePerBlock),
      maxBlock: Math.ceil(maxPage / pagePerBlock),
    };

    return { pagination, entities };
  }
}
