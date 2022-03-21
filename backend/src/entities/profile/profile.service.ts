import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './entities/profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(ProfileRepository)
    private readonly profileRepository: ProfileRepository,
  ) {}

  async isValidEmail(email: string): Promise<boolean> {
    const entity = await this.profileRepository
      .createQueryBuilder('profile')
      .where('profile.email = :email', { email })
      .getCount();

    return entity > 0;
  }

  async addProfile(
    createProfileDto: CreateProfileDto,
    queryRunner: QueryRunner,
  ): Promise<any> {
    const profileModel = await this.profileRepository.create(createProfileDto);

    return await queryRunner.manager.save(profileModel);
  }
}
