import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { Brackets, QueryRunner, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { Paginatable } from 'src/common/list-config';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';

type SafedUser = Omit<User, 'password' | 'hashPassword' | 'savePassword'>;

export type UserLoginValidationInfo = {
    isValidUser: boolean;
    isCorrectPassword: boolean;
    userInfo: Omit<
        User,
        'password' | 'hashPassword' | 'savePassword' | 'profileId'
    >;
};

type Optional<T> = { [P in keyof T]?: T[P] };

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

    async createByGithub(
        createUserDto: CreateUserDto,
        profile: Optional<Profile>,
    ) {
        const model = await this.userRepository.create(createUserDto);
        model.profile = new Profile();

        if (!profile.nickname || !profile.email) {
            throw new BadRequestException('nickname or email is empty');
        }

        model.profile.nickname = profile.nickname;
        model.profile.email = profile.email;

        return await this.userRepository.save(model);
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
        const qb = this.userRepository
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

        return await qb;
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

    async searchUserList(
        pageNumber: number,
        searchProperty:
            | keyof Pick<Profile, 'nickname'>
            | keyof Pick<User, 'id'>,
        searchQuery: string,
    ): Promise<Paginatable<User> | undefined> {
        const qb = this.userRepository
            .createQueryBuilder('user')
            .select()
            .innerJoinAndSelect('user.profile', 'profile')
            .innerJoinAndSelect('user.admins', 'admins')
            .where('admins.id IS NOT NULL');

        switch (searchProperty) {
            case 'id':
                qb.andWhere('user.id = :id', {
                    id: searchQuery,
                });
                break;
            case 'nickname':
                qb.andWhere('profile.nickname LIKE :nickname', {
                    nickname: `%${searchQuery}%`,
                });
                break;
        }

        qb.andWhere('user.isValid = :isValid', { isValid: true });

        return await this.paginationProvider
            .setPagination(qb, pageNumber)
            .getManyWithPagination(qb, pageNumber);
    }
}
