import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateConnectInfoDto {
    @IsString()
    ip!: string;

    @IsString()
    userAgent!: string;
}
