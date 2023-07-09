import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConnectInfoDto {
    @ApiProperty()
    @IsString()
    ip!: string;

    @ApiProperty()
    @IsString()
    userAgent!: string;
}
