import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import { CreateProfileDto } from './dto/create-profile.dto';
import { Profile } from './profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: BaseRepository<Profile>,
  ) {}

  async isValidEmail(email: string): Promise<boolean> {
    return await this.profileRepository.exists({ email });
  }

  async addProfile(createProfileDto: CreateProfileDto): Promise<Profile> {
    return await this.profileRepository.save(createProfileDto);
  }
}
