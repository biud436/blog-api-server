import { ApiProperty } from '@nestjs/swagger';

export class FindUserNameDto {
    @ApiProperty()
    name: string;

    @ApiProperty()
    email: string;
}
