import { ApiProperty, Assert } from 'src/common/config/create-dto-common';

export class CreateUserDto {
  @ApiProperty({ type: String, description: '유저 아이디' })
  @Assert.IsNotEmpty()
  username!: string;

  @ApiProperty({ type: String, description: '비밀 번호' })
  @Assert.IsNotEmpty()
  @Assert.Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&]{8,}$/,
    { message: '영문, 숫자, 특수문자 조합으로 8자 이상 입력해주세요.' },
  )
  password!: string;

  @ApiProperty({ type: String, description: '이메일' })
  @Assert.IsEmail()
  @Assert.IsNotEmpty()
  email!: string;
}
