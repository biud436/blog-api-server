import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@stingerloom/orm';
import { InjectRepository } from '@stingerloom/orm/nestjs';
import type { User } from '../user/user.entity';
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

  async findByIds(ids: number[]): Promise<Profile[]> {
    if (ids.length === 0) return [];
    return await this.profileRepository.find({
      where: { id: { in: ids } },
    });
  }

  /**
   * ManyToOne 으로 로드된 user 들에 profile(OneToOne) 을 붙인다.
   *
   * stingerloom 2.0 부터 find 의 `relations` 는 단일 관계 프로퍼티명만 받고
   * 중첩 경로(`'user.profile'`)는 InvalidQueryError 로 거부한다
   * (1.x 에서도 중첩 경로는 조용히 무시되어 profile 이 채워지지 않았다).
   * 업스트림 안내대로 루트 관계만 로드한 뒤 후속 쿼리 한 번으로 채운다.
   */
  async attachProfiles(users: Array<User | null | undefined>): Promise<void> {
    const targets = users.filter(
      (user): user is User => !!user && !user.profile && !!user.profileId,
    );
    if (targets.length === 0) return;

    const profiles = await this.findByIds([
      ...new Set(targets.map((user) => user.profileId)),
    ]);
    const byId = new Map(profiles.map((profile) => [profile.id, profile]));

    for (const user of targets) {
      const profile = byId.get(user.profileId);
      if (profile) {
        user.profile = profile;
      }
    }
  }
}
