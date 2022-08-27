import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class NewCategoryDto {
    @ApiProperty()
    categoryName: string;

    @ApiProperty()
    @IsOptional()
    rootNodeName?: string;
}
