import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './entities/user.repository';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Profile } from '../profile/entities/profile.entity';

type SafedUser = Omit<User, 'password' | 'hashPassword' | 'savePassword'>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async create(createUserDto: CreateUserDto, profile: Profile) {
    const model = await this.userRepository.create(createUserDto);
    model.profile = profile;

    return await this.userRepository.save(model);
  }

  async validateUser(
    username: string,
    password_: string,
  ): Promise<SafedUser | boolean | null> {
    const user = await this.userRepository.findOne({
      username,
      isActive: true,
    });

    if (!user) {
      return false;
    }

    const isValidPassword = bcrypt.compareSync(password_, user.password);
    const { password, ...safedData } = user;

    return isValidPassword ? safedData : null;
  }
}
