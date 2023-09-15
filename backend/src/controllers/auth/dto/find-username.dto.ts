import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FindUserNameDto {
    @ApiProperty()
    @IsString()
    name!: string;

    @ApiProperty()
    @IsString()
    email!: string;
}
