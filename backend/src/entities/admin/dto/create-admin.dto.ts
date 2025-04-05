import { ApiProperty, Assert } from 'src/common/config/create-dto-common';

export class CreateAdminDto {
  @ApiProperty()
  @Assert.IsString()
  @Assert.IsOptional()
  id?: number;

  @ApiProperty()
  @Assert.IsOptional()
  @Assert.IsNumber()
  userId?: number;
}
