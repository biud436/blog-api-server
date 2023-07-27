import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChangeCategoryDto {
    /**
     * @title 카테고리 이름
     */
    @IsString()
    categoryName!: string;
}
