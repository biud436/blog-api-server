import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ProfileUserDto {
  @ApiProperty()
  @IsNumber()
  id!: number;

  @ApiProperty()
  @IsString()
  username!: string;

  @ApiProperty()
  @IsString({ each: true })
  scope!: string[];

  static of(id: number, username: string, scope: string[]) {
    const profileUser = new ProfileUserDto();

    profileUser.id = id;
    profileUser.username = username;
    profileUser.scope = scope;

    return profileUser;
  }
}
