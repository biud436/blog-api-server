import { ApiProperty, Assert } from 'src/common/create-dto-common';

export class CreateProfileDto {
  @ApiProperty()
  @Assert.IsNotEmpty()
  @Assert.IsString()
  @Assert.MaxLength(100)
  email: string;
}
