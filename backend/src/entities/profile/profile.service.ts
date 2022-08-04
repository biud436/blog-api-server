import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
    ) {}

    async isValidEmail(email: string): Promise<boolean> {
        const entity = await this.profileRepository
            .createQueryBuilder('profile')
            .where('profile.email = :email', { email })
            .setPagination(1)
            .getCount();

        return entity > 0;
    }

    async addProfile(
        createProfileDto: CreateProfileDto,
        queryRunner: QueryRunner,
    ): Promise<any> {
        const profileModel = await this.profileRepository.create(
            createProfileDto,
        );

        return await queryRunner.manager.save(profileModel);
    }
}
