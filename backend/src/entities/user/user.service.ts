import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './entities/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';
import { QueryRunner } from 'typeorm';
import { plainToClass } from 'class-transformer';

type SafedUser = Omit<User, 'password' | 'hashPassword' | 'savePassword'>;

export type UserLoginValidationInfo = {
    isValidUser: boolean;
    isCorrectPassword: boolean;
    userInfo: Omit<
        User,
        'password' | 'hashPassword' | 'savePassword' | 'id' | 'profileId'
    >;
};

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserRepository)
        private readonly userRepository: UserRepository,
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
            username,
            isValid: true,
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
}
