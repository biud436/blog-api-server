import { ApiProperty, Assert } from 'src/common/create-dto-common';

export class CreateAdminDto {
    @ApiProperty()
    @Assert.IsOptional()
    id?: number;

    @ApiProperty()
    @Assert.IsNotEmpty()
    @Assert.IsNumber()
    userId: number;
}
