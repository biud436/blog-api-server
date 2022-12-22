import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class FeedDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiProperty()
    @IsString()
    description: string;
}
