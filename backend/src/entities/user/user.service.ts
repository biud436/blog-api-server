import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { QueryRunner, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Paginatable } from 'src/common/config/list-config';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';

export type UserLoginValidationInfo = {
  isValidUser: boolean;
  isCorrectPassword: boolean;
  userInfo: Omit<
    User,
    'password' | 'hashPassword' | 'savePassword' | 'profileId'
  >;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    profile: Profile,
    queryRunner: QueryRunner,
  ): Promise<User> {
    const model = await this.userRepository.create(createUserDto);
    model.profile = profile;

    return await queryRunner.manager.save(model);
  }

  async validateUser(
    username: string,
    password_: string,
  ): Promise<UserLoginValidationInfo> {
    const user = await this.userRepository.findOne({
      where: { username, isValid: true },
    });
    const isValidUser = true;
    const isCorrectPassword = false;
    const result = <UserLoginValidationInfo>{
      isValidUser,
      isCorrectPassword,
    };

    if (!user) {
      result.isValidUser = false;
      return result;
    }

    const isValidPassword = bcrypt.compareSync(password_, user.password);
    const safedData = plainToClass(User, user);

    result.userInfo = safedData;

    if (isValidPassword) {
      result.isCorrectPassword = true;
    }

    return result;
  }

  async findProfileByUsername(username: string): Promise<User | null> {
    const item = await this.userRepository
      .createQueryBuilder('user')
      .select()
      .innerJoinAndSelect('user.profile', 'profile')
      .innerJoinAndSelect('user.admins', 'admins')
      .where('user.username = :username', {
        username,
      })
      .andWhere('user.isValid = :isValid', { isValid: true })
      .andWhere('admins.id IS NOT NULL')
      .getOne();

    return item;
  }

  async getUserId(username: string): Promise<User> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .innerJoinAndSelect('user.profile', 'profile')
      .innerJoinAndSelect('user.admins', 'admins')
      .where('user.username = :username', {
        username,
      })
      .andWhere('user.isValid = :isValid', { isValid: true })
      .andWhere('admins.id IS NOT NULL')
      .getOneOrFail();

    return await qb;
  }

  async getUserIdWithoutFail(username: string): Promise<User | null> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .innerJoinAndSelect('user.profile', 'profile')
      .innerJoinAndSelect('user.admins', 'admins')
      .where('user.username = :username', {
        username,
      })
      .andWhere('admins.id IS NOT NULL')
      .getOne();

    return await qb;
  }

  async getUserList(
    pageNumber: number,
  ): Promise<Paginatable<User> | undefined> {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .select()
      .innerJoinAndSelect('user.profile', 'profile')
      .innerJoinAndSelect('user.admins', 'admins')
      .where('admins.id IS NOT NULL')
      .andWhere('user.isValid = :isValid', { isValid: true });

    const items = await this.paginationProvider
      .setPaginationWithJoin(qb, pageNumber)
      .getManyWithPagination(qb, pageNumber);

    return items;
  }
}
