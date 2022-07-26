import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserCopyDto } from './dto/create-user-copy.dto';
import { UpdateUserCopyDto } from './dto/update-user-copy.dto';
import { UserCopy } from './entities/user-copy.entity';

@Injectable()
export class UserCopyService {
    constructor(
        @InjectRepository(UserCopy)
        private readonly userCopyRepository: Repository<UserCopy>,
    ) {}

    async create(createUserCopyDto: CreateUserCopyDto) {
        const userCopy = this.userCopyRepository.create(createUserCopyDto);

        return this.userCopyRepository.save(userCopy);
    }
}
