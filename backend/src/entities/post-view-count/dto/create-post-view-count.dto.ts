import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class CreatePostViewCountDto {
    @ApiProperty()
    @IsNumber()
    id!: number;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    createdAt?: Date;

    @ApiProperty()
    @IsOptional()
    @IsDate()
    updatedAt?: Date;

    @ApiProperty()
    @IsNumber()
    count!: number;
}
