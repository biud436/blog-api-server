import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { QueryRunner, Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';

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

    async findProfileByUsername(username: string) {
        const qb = this.userRepository
            .createQueryBuilder('user')
            .select()
            .innerJoinAndSelect('user.profile', 'profile')
            .where('user.username = :username', {
                username,
            })
            .getOne();

        return await qb;
    }

    async getUserId(username: string) {
        const qb = this.userRepository
            .createQueryBuilder('user')
            .select('user.id')
            .where('user.username = :username', {
                username,
            })
            .getOneOrFail();

        return await qb;
    }

    async getUserIdWithoutFail(username: string) {
        const qb = this.userRepository
            .createQueryBuilder('user')
            .select('user.id')
            .where('user.username = :username', {
                username,
            })
            .getOne();

        return await qb;
    }
}
