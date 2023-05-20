import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { PaginationProvider } from 'src/common/modules/pagination/pagination-repository';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Profile)
        private readonly profileRepository: Repository<Profile>,
        private readonly paginationProvider: PaginationProvider,
    ) {}

    async isValidEmail(email: string): Promise<boolean> {
        const qb = this.profileRepository
            .createQueryBuilder('profile')
            .where('profile.email = :email', { email });

        this.paginationProvider.setPagination(qb, 1);

        const entity = await qb.getCount();

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
