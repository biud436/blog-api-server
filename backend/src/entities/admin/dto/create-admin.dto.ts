import { ApiProperty, Assert } from 'src/common/config/create-dto-common';

export class CreateAdminDto {
    @ApiProperty()
    @Assert.IsOptional()
    id?: number;

    @ApiProperty()
    @Assert.IsNotEmpty()
    @Assert.IsNumber()
    userId?: number;
}
