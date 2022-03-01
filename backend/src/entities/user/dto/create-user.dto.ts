import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String, description: '유저 아이디' })
  username: string;
  @ApiProperty({ type: String, description: '비밀 번호' })
  password: string;
  @ApiProperty({ type: String, description: '이메일' })
  @IsEmail()
  email: string;
}
