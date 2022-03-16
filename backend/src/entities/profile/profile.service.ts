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
    const entity = await this.profileRepository.findOne({ email });

    return !!entity;
  }

  async addProfile(
    createProfileDto: CreateProfileDto,
    queryRunner: QueryRunner,
  ): Promise<any> {
    const profileModel = this.profileRepository.create(createProfileDto);

    return await queryRunner.manager.save(profileModel);
  }
}
